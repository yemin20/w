import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "auth_token";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-in-production"
);

export type SessionUser = {
  id: string;
  email: string;
  role: "MEMBER" | "EDITOR" | "ADMIN" | "SUPERADMIN";
};

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(SECRET);

  const store = await cookies();
  // Docker/local HTTP: Secure cookie gönderilmez. COOKIE_SECURE=false ile dev ortamında düzeltilir.
  const useSecure =
    process.env.NODE_ENV === "production" &&
    process.env.COOKIE_SECURE !== "false";
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: useSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
