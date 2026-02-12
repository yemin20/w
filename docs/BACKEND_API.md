# Backend API Dokümantasyonu

Bu doküman, İHH platformu backend API uç noktalarını ve yapılandırmayı açıklar.

## Ortam Değişkenleri

`.env.local` dosyasına eklenmesi gereken değişkenler:

```env
# Veritabanı (mevcut)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."   # Migrate için

# Supabase Auth (mevcut)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."

# iyzico Ödeme (bağış için)
IYZIPAY_API_KEY="..."
IYZIPAY_SECRET_KEY="..."
IYZIPAY_URI="https://sandbox-api.iyzipay.com"   # Canlı: https://api.iyzipay.com

# E-posta (mevcut - iletişim formu)
MAIL_USER="..."
MAIL_PASS="..."
```

## API Endpoints

### Public

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/posts` | Yayınlanmış haberler (page, limit) |
| GET | `/api/posts/[slug]` | Tekil haber |
| GET | `/api/donations/categories` | Aktif bağış kategorileri |
| POST | `/api/donations/pay` | Bağış ödemesi (iyzico) |
| POST | `/api/volunteer` | Gönüllü başvurusu |
| GET | `/api/bank-accounts` | Banka hesapları |
| POST | `/api/contact` | İletişim formu |
| GET | `/api/slides` | Ana sayfa slider (mevcut) |

### Admin (Supabase Auth gerekli)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST | `/api/admin/posts` | Haber listesi / yeni haber |
| PUT/DELETE | `/api/admin/posts/[id]` | Haber güncelle / sil |
| GET/POST | `/api/admin/donations/categories` | Bağış kategorileri |
| PUT/DELETE | `/api/admin/donations/categories/[id]` | Kategori güncelle / sil |
| GET | `/api/admin/donations/transactions` | Donasyon işlem geçmişi |
| GET | `/api/admin/volunteer` | Gönüllü başvuruları (status filtresi) |
| GET/PATCH | `/api/admin/volunteer/[id]` | Başvuru detay / onay-red |
| GET/POST | `/api/admin/bank-accounts` | Banka hesapları |
| PUT/DELETE | `/api/admin/bank-accounts/[id]` | Hesap güncelle / sil |
| GET/POST | `/api/admin/slides` | Slider yönetimi (mevcut) |
| PUT/PATCH | `/api/admin/[id]` | Slide güncelle (mevcut) |

## Kurulum

```bash
npm install
npx prisma migrate deploy
npx prisma generate
```

## iyzico Test Kartları

Sandbox ortamında test için: https://dev.iyzipay.com/tr/test-kartlari
