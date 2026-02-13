import Link from "next/link";

interface NewsCardProps {
  title: string;
  description: string;
  slug?: string;
}

export default function NewsCard({ title, description, slug }: NewsCardProps) {
  return (
    <div className="border rounded-lg shadow p-4 flex flex-col">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 flex-1 mt-2 line-clamp-2">{description}</p>
      {slug && (
        <Link
          href={`/haberler/${slug}`}
          className="text-green-600 hover:text-green-700 text-sm mt-3 font-medium"
        >
          Devamını Oku →
        </Link>
      )}
    </div>
  );
}