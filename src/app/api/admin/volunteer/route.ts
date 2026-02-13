import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import type { VolunteerStatus } from "@prisma/client";

/** Admin: Gönüllü başvurularını listele */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const statusParam = searchParams.get("status");
  const validStatuses: VolunteerStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  const status = statusParam && validStatuses.includes(statusParam as VolunteerStatus)
    ? (statusParam as VolunteerStatus)
    : undefined;
  const where = status ? { status } : {};

  const [applications, total] = await Promise.all([
    prisma.volunteerApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.volunteerApplication.count({ where }),
  ]);

  return NextResponse.json({
    applications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
