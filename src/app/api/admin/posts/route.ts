import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { postCreateSchema } from "@/lib/validations";

/** Admin: Tüm haberleri listele (yayınlanmamış dahil) */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const published = searchParams.get("published");
  const where =
    published === "true" ? { published: true } : published === "false" ? { published: false } : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/** Admin: Yeni haber oluştur */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const parsed = postCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.post.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "SLUG_EXISTS", message: "Bu slug zaten kullanımda" }, { status: 409 });
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      image: parsed.data.image ?? null,
      slug: parsed.data.slug,
      published: parsed.data.published,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
