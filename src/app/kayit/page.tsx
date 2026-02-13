import Link from "next/link";

export default function KayitPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="border rounded-xl p-8 space-y-4 shadow-sm bg-gray-50">
          <h1 className="text-xl font-semibold text-gray-900">Kayıt Kapalıdır</h1>
          <p className="text-gray-600">
            Bu sistemde kayıt alınmamaktadır. Yalnızca yönetici hesabı ile giriş
            yapılabilir.
          </p>
          <Link
            href="/giris"
            className="inline-block mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
