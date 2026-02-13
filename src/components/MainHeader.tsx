"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

type AuthUser = { id: string; email: string; role: string } | null;

export default function MainHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/haberler", label: "Haberler" },
    { href: "/bagis", label: "Bağış" },
    { href: "/gonullu", label: "Gönüllü" },
    { href: "/iletisim", label: "İletişim" },
    { href: "/hesap-numaralari", label: "Hesap Numaraları" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div
        className={`
          max-w-[1440px] mx-auto px-4
          transition-all duration-300
          ${scrolled ? "h-20" : "h-28"}
        `}
      >
        <div className="grid grid-cols-3 items-center h-full">
          {/* SOL MENÜ */}
          <nav className="flex items-center gap-6 text-[15px] font-medium text-gray-800 flex-wrap">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-green-700 transition whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ORTA LOGO */}
          <div className="flex justify-center items-center">
            <Link href="/" aria-label="Ana sayfa">
              <img
                src="/ihh-logo.jpg"
                alt="İHH Logo"
                className={`
                  w-auto object-contain cursor-pointer
                  transition-all duration-300
                  ${scrolled ? "h-16" : "h-20"}
                `}
              />
            </Link>
          </div>

          {/* SAĞ */}
          <div className="flex items-center justify-end gap-4">
            {user ? (
              <>
                {user.role !== "MEMBER" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition"
                  >
                    <i className="fa-solid fa-gear" />
                    Yönetim Paneli
                  </Link>
                )}
                <span className="text-gray-600 text-sm hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-green-700 font-medium transition"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/giris"
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                Giriş Yap
              </Link>
            )}

            <Link
              href="/bagis"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <i className="fa-solid fa-hand-holding-heart text-[14px]" />
              Bağış Yap
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
