import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDonationPayment, isIyzicoConfigured } from "@/lib/iyzico";
import { donationPaySchema } from "@/lib/validations";

/**
 * Bağış ödeme akışı:
 * 1. Kategori seçilir, miktar girilir, kart bilgileri gönderilir
 * 2. Backend iyzico SDK ile ödemeyi işler
 * 3. Başarılı ise Donation kaydı oluşturulur ve DonationCategory.collected güncellenir
 * API anahtarları .env'de saklanır, asla frontend'e sızdırılmaz.
 */
export async function POST(req: Request) {
  if (!isIyzicoConfigured()) {
    return NextResponse.json(
      { error: "PAYMENT_NOT_CONFIGURED", message: "Ödeme sistemi yapılandırılmamış" },
      { status: 503 }
    );
  }

  const parsed = donationPaySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { categoryId, amount, donorName, donorEmail, donorPhone, donorIdentityNumber, paymentCard, billingAddress } =
    parsed.data;

  const category = await prisma.donationCategory.findUnique({
    where: { id: categoryId, isActive: true },
  });

  if (!category) {
    return NextResponse.json({ error: "CATEGORY_NOT_FOUND", message: "Bağış kategorisi bulunamadı" }, { status: 404 });
  }

  if (category.fixedPrice != null && Math.abs(amount - category.fixedPrice) > 0.01) {
    return NextResponse.json(
      { error: "INVALID_AMOUNT", message: `Bu kategori için sabit miktar: ${category.fixedPrice} TRY` },
      { status: 400 }
    );
  }

  const donationRecord = await prisma.donation.create({
    data: {
      categoryId,
      amount,
      currency: "TRY",
      status: "PENDING",
      donorName,
      donorEmail,
      donorPhone,
      donorIdentityNumber: donorIdentityNumber ?? null,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null,
    },
  });

  const paymentResult = await createDonationPayment(req, {
    categoryId,
    categoryName: category.name,
    amount,
    donorName,
    donorEmail,
    donorPhone,
    donorIdentityNumber: donorIdentityNumber ?? undefined,
    cardHolderName: paymentCard.cardHolderName,
    cardNumber: paymentCard.cardNumber,
    expireMonth: paymentCard.expireMonth,
    expireYear: paymentCard.expireYear,
    cvc: paymentCard.cvc,
    contactName: billingAddress.contactName,
    city: billingAddress.city,
    country: billingAddress.country,
    address: billingAddress.address,
    zipCode: billingAddress.zipCode,
  });

  if (!paymentResult.success) {
    await prisma.donation.update({
      where: { id: donationRecord.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      {
        error: "PAYMENT_FAILED",
        message: paymentResult.errorMessage ?? "Ödeme işlemi başarısız",
        errorCode: paymentResult.errorCode,
      },
      { status: 402 }
    );
  }

  await prisma.$transaction([
    prisma.donation.update({
      where: { id: donationRecord.id },
      data: {
        status: "COMPLETED",
        conversationId: paymentResult.conversationId,
        paymentId: paymentResult.paymentId,
      },
    }),
    prisma.donationCategory.update({
      where: { id: categoryId },
      data: { collected: { increment: amount } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    donationId: donationRecord.id,
    message: "Bağışınız başarıyla alındı. Teşekkür ederiz.",
  });
}
