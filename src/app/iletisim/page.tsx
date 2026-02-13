"use client";

import { useState, useEffect } from "react";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

type ContactInfo = {
  orgName: string;
  address: string;
  phone: string;
  email: string;
};

const defaultContact: ContactInfo = {
  orgName: "Sakarya İHH",
  address: "Cumhuriyet Mahallesi Uzunçarşı 1. Geçit No:2, Adapazarı / Sakarya",
  phone: "(0264) 777 24 44",
  email: "sakaryaihh@gmail.com",
};

export default function IletisimPage() {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [countryCode, setCountryCode] = useState("+90");
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/contact")
      .then((res) => res.json())
      .then((data) => setContact({ ...defaultContact, ...data }))
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors: any = {};

    // Ad soyad kontrol
    if (!form.name.trim() || form.name.trim().split(" ").length < 2) {
      newErrors.name = "Lütfen ad ve soyad giriniz";
    }

    // Telefon kontrol
    const fullPhone = `${countryCode}${form.phone}`;
    if (!/^\+\d{1,4}\d{8,15}$/.test(fullPhone)) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz";
    }

    // Email kontrol
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta giriniz";
    }

    // Mesaj kontrol
    if (!form.message.trim()) {
      newErrors.message = "Mesaj boş bırakılamaz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fullPhone = `${countryCode} ${form.phone}`;

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: fullPhone,
        }),
      });

      if (!res.ok) throw new Error("Gönderilemedi");

      setSuccess(true);
      setForm({ name: "", phone: "", email: "", message: "" });

      setTimeout(() => setSuccess(false), 5000);
    } catch {
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Başlık */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-4">Sakarya İHH İletişim</h1>
        <p className="text-gray-600">
          Bizimle iletişime geçin, birlikte iyiliği büyütelim
        </p>
      </div>

      {/* Bilgiler */}
      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div className="flex items-start gap-4">
          <PhoneIcon className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Telefon</h3>
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="text-gray-700 hover:text-green-600 transition"
            >
              {contact.phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <EnvelopeIcon className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-lg mb-1">E-posta</h3>
            <a
              href={`mailto:${contact.email}`}
              className="text-gray-700 hover:text-green-600 transition"
            >
              {contact.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 md:col-span-2">
          <MapPinIcon className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Adres</h3>
            <p className="text-gray-700">{contact.address}</p>
          </div>
        </div>
      </div>

      {/* Haritalar */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-10 text-center">
            Harita Üzerinde Bizi Bulun
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Ana Bina */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">
                Ana Bina
              </h3>
              <div className="w-full h-[300px] rounded-xl overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps?q=Cumhuriyet%20Mahallesi%20Uzunçarşı%201.%20Geçit%20No:2%20Adapazarı%20Sakarya&output=embed"
                  width="100%"
                  height="100%"
                  loading="lazy"
                ></iframe>
              </div>

              <a
                href="https://maps.google.com/?q=Cumhuriyet Mahallesi Uzunçarşı 1. Geçit No:2 Adapazarı Sakarya"
                target="_blank"
                className="block text-center mt-3 text-green-600 hover:underline"
              >
                Yol Tarifi Al
              </a>
            </div>

            {/* Hanım Binası */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">
                Hanım Binası
              </h3>
              <div className="w-full h-[300px] rounded-xl overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps?q=Yahyalar%201480.%20Sk.%20No:29%2054100%20Adapazarı%20Sakarya&output=embed"
                  width="100%"
                  height="100%"
                  loading="lazy"
                ></iframe>
              </div>

              <a
                href="https://maps.google.com/?q=Yahyalar 1480. Sk. No:29 54100 Adapazarı Sakarya"
                target="_blank"
                className="block text-center mt-3 text-green-600 hover:underline"
              >
                Yol Tarifi Al
              </a>
            </div>
          </div>
        </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 text-center">
          İletişim Formu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad Soyad */}
          <div>
            <input
              type="text"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Telefon */}
          <div>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="+90">🇹🇷 +90</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+33">🇫🇷 +33</option>
              </select>

              <input
                type="tel"
                placeholder="Telefon numarası"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="E-posta"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mesaj */}
          <div>
            <textarea
              placeholder="Mesajınız"
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>

          {success && (
            <div className="flex items-center justify-center gap-2 text-green-600 mt-6 animate-bounce">
              <CheckCircleIcon className="w-6 h-6" />
              <span>Mesajınız başarıyla gönderildi!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
