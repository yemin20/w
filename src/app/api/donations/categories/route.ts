import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public: Aktif bağış kategorilerini listele */
export async function GET() {
  const categories = await prisma.donationCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      fixedPrice: true,
      targetAmount: true,
      collected: true,
      order: true,
    },
  });
  return NextResponse.json({ categories });
}
