"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  fixedPrice: number | null;
  targetAmount: number | null;
  collected: number;
  order: number;
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function BagisPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorIdentityNumber, setDonorIdentityNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [contactName, setContactName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    fetch("/api/donations/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        if (data.categories?.length) {
          setCategoryId(data.categories[0].id);
        }
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isFixedPrice = selectedCategory?.fixedPrice != null;
  const fixedAmount = selectedCategory?.fixedPrice ?? 0;

  const handleQuickAmount = (val: number) => {
    if (!isFixedPrice) setAmount(String(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingSubmit(true);

    const numAmount = isFixedPrice
      ? fixedAmount
      : parseFloat(amount.replace(",", "."));

    if (!numAmount || numAmount <= 0) {
      setError("Geçerli bir miktar girin.");
      setLoadingSubmit(false);
      return;
    }

    const cardNum = cardNumber.replace(/\s/g, "");
    const expMonth = expireMonth.padStart(2, "0");
    const expYear = expireYear.length === 2 ? "20" + expireYear : expireYear;

    try {
      const res = await fetch("/api/donations/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          amount: numAmount,
          donorName,
          donorEmail,
          donorPhone,
          donorIdentityNumber: donorIdentityNumber || undefined,
          paymentCard: {
            cardHolderName,
            cardNumber: cardNum,
            expireMonth: expMonth,
            expireYear: expYear,
            cvc,
          },
          billingAddress: {
            contactName,
            city,
            country,
            address,
            zipCode,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.message ||
          (data.details ? JSON.stringify(data.details) : "Ödeme başarısız.");
        throw new Error(msg);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Bağışınız Alındı
          </h2>
          <p className="text-green-700">
            Yardımlarınız için teşekkür ederiz. Allah kabul etsin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Bağış Yap</h1>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center">
          Şu anda bağış kategorisi bulunmuyor. Lütfen daha sonra tekrar deneyin.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kategori Kartları */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Bağış Kategorisi Seçin
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => {
                const selected = c.id === categoryId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                      selected
                        ? "border-green-500 bg-green-50/80 shadow-md"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >
                    {c.image && (
                      <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 truncate pr-6">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                    {c.fixedPrice != null && (
                      <span className="inline-block mt-2 text-green-600 font-semibold">
                        {c.fixedPrice} ₺
                      </span>
                    )}
                    {selected && (
                      <span
                        className="absolute top-4 right-4 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                        aria-hidden
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Miktar */}
          <div>
            <label className="block text-sm font-medium mb-2">Miktar (₺)</label>
            {isFixedPrice ? (
              <p className="text-lg font-semibold">{fixedAmount} ₺</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="px-4 py-2 border rounded-lg hover:bg-green-50 hover:border-green-500 transition"
                    >
                      {val} ₺
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9,.]/g, ""))
                  }
                  placeholder="Veya miktar girin"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </>
            )}
          </div>

          {/* Bağışçı bilgileri */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Bağışçı Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Ad Soyad *"
                  required
                  minLength={2}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="E-posta *"
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="Telefon *"
                required
                minLength={10}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={donorIdentityNumber}
                onChange={(e) =>
                  setDonorIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="TC Kimlik (opsiyonel)"
                maxLength={11}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Kart bilgileri */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Kart Bilgileri</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="Kart üzerindeki isim *"
                required
                minLength={2}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(
                    e.target.value
                      .replace(/\D/g, "")
                      .replace(/(\d{4})(?=\d)/g, "$1 ")
                      .slice(0, 19)
                  )
                }
                placeholder="Kart numarası *"
                required
                maxLength={19}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={expireMonth}
                  onChange={(e) =>
                    setExpireMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  placeholder="AA"
                  required
                  maxLength={2}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={expireYear}
                  onChange={(e) =>
                    setExpireYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="YYYY"
                  required
                  maxLength={4}
                  minLength={4}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVC"
                  required
                  minLength={3}
                  maxLength={4}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Fatura adresi */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Fatura Adresi</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Alıcı adı *"
                required
                minLength={2}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adres *"
                required
                minLength={5}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="İl *"
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Posta kodu *"
                  required
                  minLength={4}
                  maxLength={10}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ülke"
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 transition"
          >
            {loadingSubmit ? "İşleniyor..." : "Bağış Yap"}
          </button>
        </form>
      )}
    </div>
  );
}
