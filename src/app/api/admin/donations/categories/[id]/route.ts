import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { donationCategorySchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: Bağış kategorisi güncelle */
export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const parsed = donationCategorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.donationCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const category = await prisma.donationCategory.update({
    where: { id },
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

  return NextResponse.json({ category });
}

/** Admin: Bağış kategorisi sil */
export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const existing = await prisma.donationCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const donationCount = await prisma.donation.count({ where: { categoryId: id } });
  if (donationCount > 0) {
    return NextResponse.json(
      { error: "HAS_DONATIONS", message: "Bu kategoride bağış kayıtları var, silinemez." },
      { status: 400 }
    );
  }

  await prisma.donationCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
