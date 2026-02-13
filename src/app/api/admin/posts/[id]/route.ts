import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { postUpdateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: Haber güncelle */
export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const parsed = postUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugExists = await prisma.post.findUnique({ where: { slug: parsed.data.slug } });
    if (slugExists) {
      return NextResponse.json({ error: "SLUG_EXISTS", message: "Bu slug zaten kullanımda" }, { status: 409 });
    }
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.image !== undefined && { image: parsed.data.image }),
      ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
      ...(parsed.data.published !== undefined && { published: parsed.data.published }),
    },
  });

  return NextResponse.json({ post });
}

/** Admin: Haber sil */
export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
