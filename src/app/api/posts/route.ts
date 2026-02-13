import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public: Yayınlanmış haberleri listeler */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  return NextResponse.json({
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
