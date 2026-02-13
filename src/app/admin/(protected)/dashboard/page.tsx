import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Heart,
  Building2,
  UserPlus,
  FileText,
  CreditCard,
  ArrowRight,
  Mail,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [postCount, categoryCount, volunteerCount, bankCount] =
    await Promise.all([
      prisma.post.count(),
      prisma.donationCategory.count(),
      prisma.volunteerApplication.count({ where: { status: "PENDING" } }),
      prisma.bankAccount.count({ where: { isActive: true } }),
    ]);

  const cards = [
    {
      href: "/admin/donations",
      label: "Bağış Kategorileri",
      count: categoryCount,
      icon: Heart,
      color: "bg-green-50 text-[#009044]",
    },
    {
      href: "/admin/bank-accounts",
      label: "Banka Hesapları",
      count: bankCount,
      icon: Building2,
      color: "bg-blue-50 text-blue-600",
    },
    {
      href: "/admin/volunteer",
      label: "Bekleyen Gönüllü Başvuruları",
      count: volunteerCount,
      icon: UserPlus,
      color: "bg-amber-50 text-amber-600",
    },
    {
      href: "/admin/posts",
      label: "Haberler",
      count: postCount,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Kontrol Paneli
      </h1>
      <p className="text-gray-600 mb-8">
        Site içeriklerini buradan yönetebilirsiniz.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, count, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#009044] hover:shadow-md transition"
          >
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{label}</p>
              <p className="text-2xl font-bold text-[#009044]">{count}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-3">Hızlı Erişim</h2>
        <ul className="space-y-2 text-gray-600">
          <li>
            <Link href="/admin/contact" className="hover:text-[#009044] flex items-center gap-2">
              <Mail className="w-4 h-4" />
              İletişim bilgilerini düzenle
            </Link>
          </li>
          <li>
            <Link href="/admin/iyzico" className="hover:text-[#009044] flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              iyzico ödeme API ayarları
            </Link>
          </li>
          <li>
            <Link href="/admin/volunteer" className="hover:text-[#009044] flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Gönüllü formu ayarları
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
