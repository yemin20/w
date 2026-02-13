import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getSession } from "./auth";

export type AuthContext = {
  userId: string;
  role: "EDITOR" | "ADMIN" | "SUPERADMIN";
};

/** Admin panel için yetki kontrolü - EDITOR, ADMIN, SUPERADMIN gerekli */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  const { role } = session;
  if (role === "MEMBER") {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "FORBIDDEN", message: "Admin yetkisi gerekli" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    ctx: { userId: session.id, role } satisfies AuthContext,
  };
}
