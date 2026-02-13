import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const parsed = contactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, email, message } = parsed.data;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 🔍 SMTP test
    await transporter.verify();
    console.log("SMTP bağlantısı OK");

    await transporter.sendMail({
      from: `"Sakarya İHH İletişim" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "Yeni İletişim Formu Mesajı",
      html: `
        <h3>Yeni Mesaj Geldi</h3>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("MAIL HATASI:", err);
    return NextResponse.json(
      { error: "Mail gönderilemedi" },
      { status: 500 }
    );
  }
}
