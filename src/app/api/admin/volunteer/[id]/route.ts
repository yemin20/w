import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { volunteerStatusSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: Gönüllü başvurusunu onayla veya reddet */
export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const parsed = volunteerStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const application = await prisma.volunteerApplication.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ application });
}

/** Admin: Gönüllü başvuru detayı */
export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const application = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!application) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ application });
}
