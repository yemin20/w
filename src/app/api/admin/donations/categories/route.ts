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

  const parsed = donationCategorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const category = await prisma.donationCategory.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      fixedPrice: parsed.data.fixedPrice ?? null,
      targetAmount: parsed.data.targetAmount ?? null,
      isActive: parsed.data.isActive,
      order: parsed.data.order,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
