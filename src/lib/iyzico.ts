/**
 * iyzico ödeme entegrasyonu - API anahtarları .env veya veritabanında saklanır.
 * Admin panelden iyzico ayarları düzenlenebilir. Öncelik: DB > env
 */

export type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  baseUri: string;
};

async function getIyzicoConfig(): Promise<IyzicoConfig | null> {
  const fromEnv = {
    apiKey: process.env.IYZIPAY_API_KEY ?? "",
    secretKey: process.env.IYZIPAY_SECRET_KEY ?? "",
    baseUri: process.env.IYZIPAY_URI ?? "https://sandbox-api.iyzipay.com",
  };
  if (fromEnv.apiKey && fromEnv.secretKey) return fromEnv;

  try {
    const { prisma } = await import("./prisma");
    const setting = await prisma.setting.findUnique({
      where: { id: "iyzico" },
    });
    if (!setting) return null;
    const db = JSON.parse(setting.value) as IyzicoConfig;
    if (db.apiKey && db.secretKey) return db;
  } catch {
    // ignore
  }
  return null;
}

export type IyzicoPaymentResult =
  | { success: true; paymentId: string; conversationId: string }
  | { success: false; errorCode?: string; errorMessage?: string };

function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  const realIp = req.headers.get("x-real-ip");
  return realIp ?? null;
}

export async function createDonationPayment(
  req: Request,
  params: {
    categoryId: string;
    categoryName: string;
    amount: number;
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    donorIdentityNumber?: string;
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  }
): Promise<IyzicoPaymentResult> {
  const config = await getIyzicoConfig();
  if (!config) {
    throw new Error("iyzico API ayarları tanımlı değil. Admin panelden yapılandırın.");
  }
  // @ts-expect-error iyzipay has no types
  const Iyzipay = (await import("iyzipay")).default;
  const iyzipay = new Iyzipay({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    uri: config.baseUri,
  });

  const conversationId = `don-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ip = getClientIp(req) ?? "85.34.78.112";

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    price: String(params.amount.toFixed(2)),
    paidPrice: String((params.amount * 1.02).toFixed(2)), // iyzico komisyonu
    currency: Iyzipay.CURRENCY.TRY,
    installment: "1",
    basketId: `BASKET-${params.categoryId.slice(-8)}`,
    paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    paymentCard: {
      cardHolderName: params.cardHolderName,
      cardNumber: params.cardNumber.replace(/\s/g, ""),
      expireMonth: params.expireMonth,
      expireYear: params.expireYear,
      cvc: params.cvc,
      registerCard: "0",
    },
    buyer: {
      id: `BY-${params.donorEmail.slice(0, 20).replace(/[^a-z0-9]/gi, "")}`,
      name: params.donorName.split(" ")[0] ?? params.donorName,
      surname: params.donorName.split(" ").slice(1).join(" ") || params.donorName,
      gsmNumber: params.donorPhone.startsWith("+") ? params.donorPhone : `+90${params.donorPhone.replace(/^0/, "")}`,
      email: params.donorEmail,
      identityNumber: params.donorIdentityNumber ?? "11111111111",
      lastLoginDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      registrationDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      registrationAddress: params.address,
      ip,
      city: params.city,
      country: params.country,
      zipCode: params.zipCode,
    },
    shippingAddress: {
      contactName: params.contactName,
      city: params.city,
      country: params.country,
      address: params.address,
      zipCode: params.zipCode,
    },
    billingAddress: {
      contactName: params.contactName,
      city: params.city,
      country: params.country,
      address: params.address,
      zipCode: params.zipCode,
    },
    basketItems: [
      {
        id: `BI-${params.categoryId}`,
        name: params.categoryName,
        category1: "Donation",
        category2: "Bağış",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: String(params.amount.toFixed(2)),
      },
    ],
  };

  return new Promise((resolve) => {
    iyzipay.payment.create(request, (err: Error | null, result: { status?: string; paymentId?: string; errorCode?: string; errorMessage?: string }) => {
      if (err) {
        resolve({ success: false, errorMessage: err.message });
        return;
      }
      if (result.status === "success" && result.paymentId) {
        resolve({ success: true, paymentId: result.paymentId, conversationId });
      } else {
        resolve({
          success: false,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage ?? "Ödeme işlemi başarısız",
        });
      }
    });
  });
}

export async function isIyzicoConfigured(): Promise<boolean> {
  if (process.env.IYZIPAY_API_KEY && process.env.IYZIPAY_SECRET_KEY) return true;
  try {
    const config = await getIyzicoConfig();
    return !!(config?.apiKey && config?.secretKey);
  } catch {
    return false;
  }
}
