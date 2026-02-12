import { z } from "zod";

export const postCreateSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur").max(200),
  content: z.string().min(1, "İçerik zorunludur"),
  image: z.string().url().optional().nullable(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  published: z.boolean().optional().default(false),
});

export const postUpdateSchema = postCreateSchema.partial();

export const donationCategorySchema = z.object({
  name: z.string().min(1, "İsim zorunludur").max(100),
  description: z.string().min(1),
  fixedPrice: z.number().positive().optional().nullable(),
  targetAmount: z.number().positive().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Banka adı zorunludur").max(100),
  branch: z.string().min(1, "Şube zorunludur").max(100),
  iban: z.string().transform((s) => s.replace(/\s/g, "").toUpperCase()).pipe(z.string().length(26).regex(/^TR[0-9]{24}$/, "Geçerli TR IBAN girin")),
  currency: z.string().length(3).optional().default("TRY"),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const volunteerApplicationSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı").max(100),
  email: z.string().email("Geçerli e-posta adresi girin"),
  phone: z.string().min(10, "Geçerli telefon numarası girin").max(20),
  reason: z.string().min(10, "Başvuru gerekçesi en az 10 karakter olmalı").max(2000),
});

export const volunteerStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const donationPaySchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().positive("Miktar 0'dan büyük olmalı"),
  donorName: z.string().min(2).max(100),
  donorEmail: z.string().email(),
  donorPhone: z.string().min(10).max(20),
  donorIdentityNumber: z.string().length(11).regex(/^[0-9]+$/).optional(),
  paymentCard: z.object({
    cardHolderName: z.string().min(2),
    cardNumber: z.string().min(15).max(19),
    expireMonth: z.string().length(2).regex(/^(0[1-9]|1[0-2])$/),
    expireYear: z.string().length(4).regex(/^20[2-9][0-9]$/),
    cvc: z.string().min(3).max(4),
  }),
  billingAddress: z.object({
    contactName: z.string().min(2),
    city: z.string().min(1),
    country: z.string().min(1),
    address: z.string().min(5),
    zipCode: z.string().min(4).max(10),
  }),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type DonationCategoryInput = z.infer<typeof donationCategorySchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type VolunteerApplicationInput = z.infer<typeof volunteerApplicationSchema>;
export type DonationPayInput = z.infer<typeof donationPaySchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalı").max(100),
  phone: z.string().min(10, "Geçerli telefon numarası girin").max(20),
  email: z.string().email("Geçerli e-posta adresi girin"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı").max(2000),
});
