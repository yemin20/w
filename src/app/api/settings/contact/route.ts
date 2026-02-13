import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public: İletişim bilgilerini getir */
export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { id: "contact_info" },
  });

  const defaultValue = {
    orgName: "Sakarya İHH Akıf Derneği",
    address: "Cumhuriyet Mahallesi Uzunçarşı 1. Geçit No:2, Adapazarı / Sakarya",
    phone: "(0264) 777 24 44",
    email: "sakaryaihh@gmail.com",
    facebook: "",
    twitter: "",
    instagram: "",
  };

  const value = setting
    ? (JSON.parse(setting.value) as typeof defaultValue)
    : defaultValue;

  return NextResponse.json(value);
}
