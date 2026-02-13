import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { VolunteerFormConfig } from "@/lib/volunteer-form";
import { defaultVolunteerFormConfig } from "@/lib/volunteer-form";

/** Config'e göre dinamik validasyon */
function validatePayload(
  payload: unknown,
  config: VolunteerFormConfig
): { ok: true; data: Record<string, unknown> } | { ok: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Geçersiz form verisi." };
  }

  const data: Record<string, unknown> = {};
  const obj = payload as Record<string, unknown>;

  for (const field of config.fields) {
    const val = obj[field.key];

    if (field.required) {
      if (val === undefined || val === null) {
        return { ok: false, message: `${field.label} zorunludur.` };
      }
      if (typeof val === "string" && val.trim() === "") {
        return { ok: false, message: `${field.label} zorunludur.` };
      }
      if (Array.isArray(val) && val.length === 0) {
        return { ok: false, message: `${field.label} en az bir seçenek gerektirir.` };
      }
    }

    if (val !== undefined && val !== null) {
      if (field.type === "email" && typeof val === "string") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return { ok: false, message: "Geçerli bir e-posta adresi girin." };
        }
      }
      if (field.type === "tel" && typeof val === "string") {
        if (val.length < 10 || val.length > 20) {
          return { ok: false, message: "Geçerli bir telefon numarası girin." };
        }
      }
      if (field.minLength && typeof val === "string") {
        if (val.length < field.minLength) {
          return {
            ok: false,
            message: `${field.label} en az ${field.minLength} karakter olmalı.`,
          };
        }
      }
      if (field.maxLength && typeof val === "string") {
        if (val.length > field.maxLength) {
          return {
            ok: false,
            message: `${field.label} en fazla ${field.maxLength} karakter olmalı.`,
          };
        }
      }
      data[field.key] = val;
    }
  }

  return { ok: true, data };
}

/** fullName, email, phone, reason değerlerini data ve config'den çıkar (liste için) */
function extractDisplayFields(
  data: Record<string, unknown>,
  config: VolunteerFormConfig
): { fullName: string; email: string; phone: string; reason: string } {
  const getStr = (key: string): string => {
    const v = data[key];
    if (Array.isArray(v)) return v.join(", ");
    return typeof v === "string" ? v : "";
  };

  const byKey = (key: string) => getStr(key);
  const byType = (t: "text" | "email" | "tel" | "textarea") => {
    const f = config.fields.find((x) => x.type === t);
    return f ? getStr(f.key) : "";
  };

  return {
    fullName:
      byKey("fullName") ||
      byKey("adSoyad") ||
      byKey("name") ||
      byType("text") ||
      "-",
    email: byKey("email") || byKey("eposta") || byType("email") || "-",
    phone: byKey("phone") || byKey("telefon") || byType("tel") || "-",
    reason:
      byKey("reason") ||
      byKey("message") ||
      byKey("mesaj") ||
      byType("textarea") ||
      "-",
  };
}

/** Public: Gönüllü başvuru formu submit */
export async function POST(req: Request) {
  let config: VolunteerFormConfig;
  try {
    const setting = await prisma.setting.findUnique({
      where: { id: "volunteer_form" },
    });
    config = setting
      ? (JSON.parse(setting.value) as VolunteerFormConfig)
      : defaultVolunteerFormConfig;
    if (!config.fields || !Array.isArray(config.fields)) {
      config = defaultVolunteerFormConfig;
    }
  } catch {
    config = defaultVolunteerFormConfig;
  }

  const body = await req.json();
  const validation = validatePayload(body, config);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: validation.message },
      { status: 400 }
    );
  }

  const { fullName, email, phone, reason } = extractDisplayFields(
    validation.data as Record<string, unknown>,
    config
  );

  const application = await prisma.volunteerApplication.create({
    data: {
      fullName,
      email,
      phone,
      reason,
      data: validation.data as object,
    },
  });

  return NextResponse.json(
    {
      success: true,
      id: application.id,
      message: "Başvurunuz alındı. En kısa sürede değerlendirilecektir.",
    },
    { status: 201 }
  );
}
