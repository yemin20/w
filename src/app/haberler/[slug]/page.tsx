import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HaberDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });

  if (!post) {
    notFound();
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/haberler"
        className="text-green-600 hover:text-green-700 text-sm font-medium mb-6 inline-block"
      >
        ← Haberlere dön
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <time className="text-gray-500 text-sm">{dateStr}</time>
      </header>

      {post.image && (
        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-green max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
