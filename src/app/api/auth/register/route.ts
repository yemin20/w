import { NextResponse } from "next/server";

/**
 * Kayıt kapalıdır. Sistemde yalnızca tek yönetici hesabı vardır (seed ile oluşturulur).
 */
export async function POST() {
  return NextResponse.json(
    { error: "REGISTRATION_DISABLED", message: "Kayıt kapalıdır. Yalnızca yönetici hesabı ile giriş yapılabilir." },
    { status: 403 }
  );
}
