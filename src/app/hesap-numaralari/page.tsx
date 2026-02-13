import { prisma } from "@/lib/prisma";
import BankAccordion from "@/components/BankAccordion";

export const dynamic = "force-dynamic";

export default async function HesapNumaralariPage() {
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
    acc[a.bankName].push({
      branch: a.branch,
      iban: a.iban,
      currency: a.currency,
    });
    return acc;
  }, {});

  const banks = Object.entries(byBank).map(([name, accs]) => ({
    name,
    accounts: accs.map((a) => `${a.currency} IBAN: ${a.iban}`),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Başlık */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            🏦
          </div>
          <h1 className="text-2xl font-bold">Banka Hesap Numaralarımız</h1>
        </div>

        {/* Liste */}
        {banks.length > 0 ? (
          <div className="space-y-4">
            {banks.map((bank) => (
              <BankAccordion key={bank.name} bank={bank} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Henüz banka hesabı eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
