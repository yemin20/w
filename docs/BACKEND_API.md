# Backend API Dokümantasyonu

Bu doküman, İHH platformu backend API uç noktalarını ve yapılandırmayı açıklar.

## Docker ile Çalıştırma

Proje Docker ile çalıştırılabilir; PostgreSQL otomatik ayağa kalkar ve migration uygulanır.

```bash
# Build + başlat
docker compose up --build

# Arka planda
docker compose up -d --build
```

- **Uygulama:** http://localhost:3000
- **PostgreSQL:** localhost:5432 (user: postgres, pass: postgres, db: ihh_web)

## Ortam Değişkenleri

`.env.local` dosyasına eklenmesi gereken değişkenler:

```env
# Veritabanı (mevcut)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."   # Migrate için

# Auth (JWT session)
AUTH_SECRET="..."   # Production için güçlü rastgele değer

# iyzico Ödeme (bağış için)
IYZIPAY_API_KEY="..."
IYZIPAY_SECRET_KEY="..."
IYZIPAY_URI="https://sandbox-api.iyzipay.com"   # Canlı: https://api.iyzipay.com

# E-posta (mevcut - iletişim formu)
MAIL_USER="..."
MAIL_PASS="..."
```

## API Endpoints

### Auth (Public)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş (email, password) |
| POST | `/api/auth/register` | **Kapalı** – Kayıt alınmaz, yalnızca yönetici hesabı |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/auth/me` | Mevcut oturum bilgisi |

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

### Public Ayarlar (API key gerekmez)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/settings/contact` | İletişim bilgileri (footer, iletişim sayfası) |
| GET | `/api/settings/volunteer-form` | Gönüllü formu metinleri |

### Admin (Oturum açmış admin kullanıcı gerekli)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/admin/settings?key=...` | Ayar getir (contact_info, volunteer_form, iyzico) |
| PUT | `/api/admin/settings` | Ayar güncelle |
| GET/POST | `/api/admin/posts` | Haber listesi / yeni haber |
| PUT/DELETE | `/api/admin/posts/[id]` | Haber güncelle / sil |
| GET/POST | `/api/admin/donations/categories` | Bağış kategorileri (ad, açıklama, görsel, fiyat) |
| PUT/DELETE | `/api/admin/donations/categories/[id]` | Kategori güncelle / sil |
| GET | `/api/admin/donations/transactions` | Donasyon işlem geçmişi |
| GET | `/api/admin/volunteer` | Gönüllü başvuruları (status filtresi) |
| GET/PATCH | `/api/admin/volunteer/[id]` | Başvuru detay / onay-red |
| GET/POST | `/api/admin/bank-accounts` | Banka hesapları |
| PUT/DELETE | `/api/admin/bank-accounts/[id]` | Hesap güncelle / sil |

## Kurulum

```bash
npm install
npx prisma migrate deploy
npx prisma generate
```

## İlk Admin Kullanıcı

`docker compose up` sırasında seed servisi otomatik çalışır ve admin kullanıcıyı oluşturur.

```bash
# Lokal (migration sonrası)
SEED_ADMIN_EMAIL=admin@localhost SEED_ADMIN_PASSWORD=admin123 npm run db:seed

# Docker - seed ayrı çalıştırmak için
docker compose run --rm seed
```

Varsayılan: admin@localhost / admin123. `.env` ile özelleştir: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

## iyzico Test Kartları

Sandbox ortamında test için: https://dev.iyzipay.com/tr/test-kartlari
