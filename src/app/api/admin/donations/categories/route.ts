import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { donationCategorySchema } from "@/lib/validations";

/** Admin: Bağış kategorilerini listele (tümü) */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const categories = await prisma.donationCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { donations: true } } },
  });
  return NextResponse.json({ categories });
}

/** Admin: Yeni bağış kategorisi oluştur */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Geçersiz istek formatı" },
      { status: 400 }
    );
  }

  const parsed = donationCategorySchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const firstError = Object.values(flat.fieldErrors).flat()[0];
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: (firstError as string) ?? "Alanları kontrol edin",
        details: flat,
      },
      { status: 400 }
    );
  }

  const category = await prisma.donationCategory.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      image: parsed.data.image ?? null,
      fixedPrice: parsed.data.fixedPrice ?? null,
      targetAmount: parsed.data.targetAmount ?? null,
      isActive: parsed.data.isActive,
      order: parsed.data.order,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
