import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { volunteerApplicationSchema } from "@/lib/validations";

/** Public: Gönüllü başvuru formu submit */
export async function POST(req: Request) {
  const parsed = volunteerApplicationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const application = await prisma.volunteerApplication.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      reason: parsed.data.reason,
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
