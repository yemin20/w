import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public: Aktif banka hesaplarını listele (hesap numaraları sayfası için) */
export async function GET() {
  const accounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      bankName: true,
      branch: true,
      iban: true,
      currency: true,
    },
  });

  const byBank = accounts.reduce<
    Record<string, Array<{ branch: string; iban: string; currency: string }>>
  >((acc, a) => {
    if (!acc[a.bankName]) acc[a.bankName] = [];
    acc[a.bankName].push({ branch: a.branch, iban: a.iban, currency: a.currency });
    return acc;
  }, {});

  const banks = Object.entries(byBank).map(([name, accounts]) => ({
    name,
    accounts: accounts.map((a) => `${a.currency} IBAN: ${a.iban}`),
  }));

  return NextResponse.json({ banks });
}
