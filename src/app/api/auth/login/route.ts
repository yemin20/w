import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { z } from "zod";

const getCookieOptions = () => ({
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" &&
    process.env.COOKIE_SECURE !== "false",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});

const schema = z.object({
  email: z.string().min(1, "E-posta gerekli").refine(
    (v) => /^[^\s@]+@[^\s@]+$/.test(v),
    "Geçerli e-posta formatı girin"
  ),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Geçersiz istek formatı" },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first = Object.values(flat.fieldErrors).flat()[0];
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: (first as string) ?? "E-posta ve şifre gereklidir",
        details: flat,
      },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS", message: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS", message: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  const token = await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  res.cookies.set("auth_token", token, getCookieOptions());
  return res;
}
