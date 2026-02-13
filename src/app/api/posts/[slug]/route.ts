import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

/** Public: Tekil haber detayı */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });
  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
