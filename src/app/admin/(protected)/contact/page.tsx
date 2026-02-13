"use client";

import { useState, useEffect } from "react";

type ContactInfo = {
  orgName: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

const defaultContact: ContactInfo = {
  orgName: "Sakarya İHH Akıf Derneği",
  address: "Adapazarı, Sakarya",
  phone: "+90 264 777 24 44",
  email: "sakaryaihh@gmail.com",
  facebook: "",
  twitter: "",
  instagram: "",
};

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactInfo>(defaultContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=contact_info", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setForm({ ...defaultContact, ...data.value });
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
      body: JSON.stringify({ key: "contact_info", value: form }),
    });
    setSaving(false);
    alert("İletişim bilgileri kaydedildi.");
  };

  if (loading) return <p className="p-6 text-gray-500">Yükleniyor...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        İletişim Bilgileri
      </h1>
      <p className="text-gray-600 mb-6">
        Bu bilgiler footer ve iletişim sayfasında görüntülenir.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kurum Adı
          </label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) =>
              setForm({ ...form, orgName: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
          />
        </div>
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Sosyal Medya</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) =>
                  setForm({ ...form, facebook: e.target.value })
                }
                placeholder="https://facebook.com/..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={form.twitter}
                onChange={(e) =>
                  setForm({ ...form, twitter: e.target.value })
                }
                placeholder="https://twitter.com/..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) =>
                  setForm({ ...form, instagram: e.target.value })
                }
                placeholder="https://instagram.com/..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
