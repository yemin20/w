import Link from "next/link";

export default function AdminPostsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Haber Yönetimi</h1>
        <Link
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          href="/"
        >
          Siteye dön
        </Link>
      </div>

      <nav className="flex gap-4 mb-8">
        <Link href="/admin/posts" className="text-green-600 font-medium">
          Haberler
        </Link>
        <Link href="/admin/volunteer" className="text-gray-600 hover:text-green-600">
          Gönüllü Başvuruları
        </Link>
        <Link href="/admin/bank-accounts" className="text-gray-600 hover:text-green-600">
          Banka Hesapları
        </Link>
        <Link href="/admin/donations" className="text-gray-600 hover:text-green-600">
          Bağış Kategorileri
        </Link>
      </nav>

      <p className="text-gray-600">
        Haberler burada listelenecek. API: <code className="bg-gray-100 px-1">/api/admin/posts</code>
      </p>
    </div>
  );
}
