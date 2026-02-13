import { prisma } from "@/lib/prisma";
import NewsCard from "@/components/NewsCard";

export const dynamic = "force-dynamic";

export default async function HaberlerPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      image: true,
      createdAt: true,
    },
  });

  const stripHtml = (html: string, maxLen: number) => {
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
  };

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Haberler</h1>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              title={post.title}
              description={stripHtml(post.content, 150)}
              slug={post.slug}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Henüz yayınlanmış haber bulunmuyor.</p>
      )}
    </section>
  );
}
