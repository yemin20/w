"use client";

import { useState, useEffect } from "react";

type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  baseUri: string;
};

const defaultConfig: IyzicoConfig = {
  apiKey: "",
  secretKey: "",
  baseUri: "https://sandbox-api.iyzipay.com",
};

export default function AdminIyzicoPage() {
  const [form, setForm] = useState<IyzicoConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=iyzico", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setForm({ ...defaultConfig, ...data.value });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ key: "iyzico", value: form }),
    });
    setSaving(false);
    alert("iyzico ayarları kaydedildi. Bağış ödemeleri bu ayarları kullanacaktır.");
  };

  if (loading) return <p className="p-6 text-gray-500">Yükleniyor...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        iyzico Ödeme Ayarları
      </h1>
      <p className="text-gray-600 mb-6">
        Bağış ödemeleri için iyzico altyapısı API bilgileri. Bu ayarlar .env
        değişkenlerinden önceliklidir.
      </p>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Güvenlik:</strong> API anahtarları veritabanında saklanır.
          Production ortamında hassas verileri şifrelemeniz önerilir. Test için
          sandbox, canlı ödeme için production URI kullanın.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl border border-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type={showSecret ? "text" : "password"}
            value={form.apiKey}
            onChange={(e) =>
              setForm({ ...form, apiKey: e.target.value })
            }
            placeholder="iyzico panelden alın"
            className="w-full border rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secret Key
          </label>
          <input
            type={showSecret ? "text" : "password"}
            value={form.secretKey}
            onChange={(e) =>
              setForm({ ...form, secretKey: e.target.value })
            }
            placeholder="iyzico panelden alın"
            className="w-full border rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showSecret"
            checked={showSecret}
            onChange={(e) => setShowSecret(e.target.checked)}
          />
          <label htmlFor="showSecret" className="text-sm">
            Anahtarları göster
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Base URI
          </label>
          <select
            value={form.baseUri}
            onChange={(e) =>
              setForm({ ...form, baseUri: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
          >
            <option value="https://sandbox-api.iyzipay.com">
              Sandbox (Test)
            </option>
            <option value="https://api.iyzipay.com">Production (Canlı)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Test için Sandbox, gerçek ödeme için Production seçin.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Test Kartları (Sandbox)</h3>
        <p className="text-sm text-gray-600">
          Sandbox ortamında test için:{" "}
          <a
            href="https://dev.iyzipay.com/tr/test-kartlari"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#009044] hover:underline"
          >
            iyzico test kartları
          </a>
        </p>
      </div>
    </div>
  );
}
