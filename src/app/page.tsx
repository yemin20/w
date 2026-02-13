import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import VolunteerForm from "@/components/VolunteerForm";
import { prisma } from "@/lib/prisma";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      image: true,
      createdAt: true,
    },
  });

  return (
    <>
      {/* HERO - Basit statik alan */}
      <section className="bg-green-600 py-16 px-4">
        <div className="max-w-[1440px] mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Sakarya İHH İnsani Yardım Vakfı
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Birlikte iyiliği büyütüyoruz
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bagis"
              className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Bağış Yap
            </Link>
            <Link
              href="/gonullu"
              className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Gönüllü Ol
            </Link>
          </div>
        </div>
      </section>

      {/* GÜNCEL HABERLER */}
      <section className="max-w-[1440px] mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Güncel Haberler</h2>
          <Link
            href="/haberler"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tümünü gör →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <NewsCard
                key={post.id}
                title={post.title}
                description={post.content.substring(0, 120).replace(/<[^>]*>/g, "") + (post.content.length > 120 ? "..." : "")}
                slug={post.slug}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">Henüz haber bulunmuyor.</p>
          )}
        </div>
      </section>

      {/* GÖNÜLLÜ OL */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Gönüllü Ol</h2>
          <VolunteerForm />
        </div>
      </section>
    </>
  );
}
