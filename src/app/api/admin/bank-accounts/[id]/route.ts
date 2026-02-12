import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { bankAccountSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: Banka hesabı güncelle */
export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const parsed = bankAccountSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const iban = parsed.data.iban;
  if (iban !== existing.iban) {
    const ibanExists = await prisma.bankAccount.findUnique({ where: { iban } });
    if (ibanExists) {
      return NextResponse.json(
        { error: "IBAN_EXISTS", message: "Bu IBAN zaten kayıtlı" },
        { status: 409 }
      );
    }
  }

  const account = await prisma.bankAccount.update({
    where: { id },
    data: {
      bankName: parsed.data.bankName,
      branch: parsed.data.branch,
      iban,
      currency: parsed.data.currency,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ account });
}

/** Admin: Banka hesabı sil */
export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const existing = await prisma.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.bankAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
