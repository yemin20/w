import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role === "MEMBER") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <Link href="/admin/dashboard" className="mb-6">
          <h2 className="text-lg font-bold text-[#009044]">Admin Panel</h2>
        </Link>
        <AdminNav />
        <div className="mt-auto pt-4 border-t">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#009044]"
          >
            Siteye Dön
          </Link>
          <Link
            href="/admin/logout"
            className="text-sm text-red-600 hover:underline block"
          >
            Çıkış Yap
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
