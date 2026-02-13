"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Building2,
  UserPlus,
  Mail,
  CreditCard,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Kontrol Paneli", icon: LayoutDashboard },
  { href: "/admin/donations", label: "Bağış Kategorileri", icon: Heart },
  { href: "/admin/bank-accounts", label: "Banka Hesapları", icon: Building2 },
  { href: "/admin/volunteer", label: "Gönüllü Başvuruları", icon: UserPlus },
  { href: "/admin/contact", label: "İletişim Bilgileri", icon: Mail },
  { href: "/admin/iyzico", label: "iyzico Ödeme Ayarları", icon: CreditCard },
  { href: "/admin/posts", label: "Haberler", icon: FileText },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive
                ? "bg-[#009044] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
