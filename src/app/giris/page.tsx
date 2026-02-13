"use client";

import { useState } from "react";
import Link from "next/link";

export default function GirisPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data.message ?? data.error ?? "Giriş yapılamadı");
      return;
    }

    // Yönetici ise doğrudan yönetim paneline yönlendir
    const isAdmin = data.user?.role && data.user.role !== "MEMBER";
    window.location.href = isAdmin ? "/admin/dashboard" : "/";
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={onSubmit}
          className="border rounded-xl p-6 space-y-4 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-center">Üye Girişi</h1>

          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2.5 font-medium disabled:opacity-60 transition"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Yalnızca yönetici hesabı ile giriş yapılabilir.
        </p>
      </div>
    </div>
  );
}
