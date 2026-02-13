import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { bankAccountSchema } from "@/lib/validations";

/** Admin: Banka hesaplarını listele */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ order: "asc" }, { bankName: "asc" }],
  });
  return NextResponse.json({ accounts });
}

/** Admin: Yeni banka hesabı ekle */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const parsed = bankAccountSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const iban = parsed.data.iban;
  const existingIban = await prisma.bankAccount.findUnique({
    where: { iban },
  });
  if (existingIban) {
    return NextResponse.json(
      { error: "IBAN_EXISTS", message: "Bu IBAN zaten kayıtlı" },
      { status: 409 }
    );
  }

  const account = await prisma.bankAccount.create({
    data: {
      bankName: parsed.data.bankName,
      branch: parsed.data.branch,
      iban,
      currency: parsed.data.currency,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ account }, { status: 201 });
}
