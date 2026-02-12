import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import type { DonationStatus } from "@prisma/client";

/** Admin: Donasyon işlem geçmişini listele */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const categoryId = searchParams.get("categoryId");
  const statusParam = searchParams.get("status");
  const validStatuses: DonationStatus[] = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
  const status = statusParam && validStatuses.includes(statusParam as DonationStatus)
    ? (statusParam as DonationStatus)
    : undefined;
  const where: { categoryId?: string; status?: DonationStatus } = {};
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { category: { select: { name: true } } },
    }),
    prisma.donation.count({ where }),
  ]);

  return NextResponse.json({
    donations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
