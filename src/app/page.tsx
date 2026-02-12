import NewsCard from "@/components/NewsCard";
import NewsSlider, { type Slide } from "@/components/NewsSlider";
import VolunteerForm from "@/components/VolunteerForm";
import { prisma } from "@/lib/prisma";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const slides = await prisma.slide.findMany({
    where: { isActive: true, isArchived: false },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const sliderSlides: Slide[] = slides.map((s) => ({
    id: s.id,
    title: s.title,
    desc: s.desc,
    imageUrl: s.imageUrl,
    thumbUrl: s.thumbUrl,
    ctaText: s.ctaText,
    ctaHref: s.ctaHref,
  }));

  return (
    <>
      {/* HERO SLIDER (SSR: DB'den gelen) */}
      <section className="max-w-[1440px] mx-auto px-4 pt-4">
        <NewsSlider slides={sliderSlides} />
      </section>

      {/* GÜNCEL HABERLER */}
      <section className="max-w-[1440px] mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Güncel Haberler</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <NewsCard title="Haber Başlığı 1" description="Kısa açıklama..." />
          <NewsCard title="Haber Başlığı 2" description="Kısa açıklama..." />
          <NewsCard title="Haber Başlığı 3" description="Kısa açıklama..." />
          <NewsCard title="Haber Başlığı 4" description="Kısa açıklama..." />
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
