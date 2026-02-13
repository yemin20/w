import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultVolunteerFormConfig } from "@/lib/volunteer-form";
import type { VolunteerFormConfig } from "@/lib/volunteer-form";

/** Public: Gönüllü form ayarlarını getir */
export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { id: "volunteer_form" },
  });

  const value: VolunteerFormConfig = setting
    ? (JSON.parse(setting.value) as VolunteerFormConfig)
    : defaultVolunteerFormConfig;

  // Eski format varsa varsayılana dön
  if (!value.fields || !Array.isArray(value.fields)) {
    return NextResponse.json(defaultVolunteerFormConfig);
  }

  return NextResponse.json(value);
}
