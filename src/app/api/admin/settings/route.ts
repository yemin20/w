import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { defaultVolunteerFormConfig } from "@/lib/volunteer-form";

export const dynamic = "force-dynamic";

const SETTING_KEYS = [
  "contact_info",
  "volunteer_form",
  "iyzico",
] as const;

/** Admin: Ayar getir (key ile) */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key || !SETTING_KEYS.includes(key as (typeof SETTING_KEYS)[number])) {
    return NextResponse.json({ error: "INVALID_KEY" }, { status: 400 });
  }

  const setting = await prisma.setting.findUnique({
    where: { id: key },
  });

  const defaultValue =
    key === "contact_info"
      ? {
          orgName: "Sakarya İHH Akıf Derneği",
          address:
            "Cumhuriyet Mahallesi Uzunçarşı 1. Geçit No:2, Adapazarı / Sakarya",
          phone: "(0264) 777 24 44",
          email: "sakaryaihh@gmail.com",
          facebook: "",
          twitter: "",
          instagram: "",
        }
      : key === "volunteer_form"
        ? defaultVolunteerFormConfig
        : {
            apiKey: "",
            secretKey: "",
            baseUri: "https://sandbox-api.iyzipay.com",
          };

  const value = setting
    ? (JSON.parse(setting.value) as object)
    : defaultValue;

  return NextResponse.json({ key, value });
}

/** Admin: Ayar güncelle */
export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const body = await req.json();
  const { key, value } = body;

  if (!key || !SETTING_KEYS.includes(key as (typeof SETTING_KEYS)[number])) {
    return NextResponse.json({ error: "INVALID_KEY" }, { status: 400 });
  }

  await prisma.setting.upsert({
    where: { id: key },
    create: { id: key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });

  return NextResponse.json({ success: true });
}
