import { fetchGraphQL } from "@/lib/graphql";
import { GET_POST_BY_SLUG } from "@/lib/queries";
import { PostDetail } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await fetchGraphQL(GET_POST_BY_SLUG, { slug });
  const post: PostDetail | null = data.postBy;

  if (!post) return {};

  const image = post.featuredImage?.node;

  return {
    title: post.title,
    description: post.excerpt.replace(/<[^>]*>/g, "").slice(0, 155),
    openGraph: {
      title: post.title,
      description: post.excerpt.replace(/<[^>]*>/g, "").slice(0, 155),
      images: image ? [{ url: image.sourceUrl }] : [],
    },
  };
}

export const dynamic = "force-dynamic";

/*export async function generateStaticParams() {
  const data = await fetchGraphQL(GET_POSTS);
  return data.posts.nodes.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}*/

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchGraphQL(GET_POST_BY_SLUG, { slug });
  const post: PostDetail | null = data.postBy;

  if (!post) {
    notFound();
  }

  const date = new Date(post.date).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const image = post.featuredImage?.node;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="text-blue-600 text-sm hover:underline mb-8 inline-block"
      >
        ← Powrót do bloga
      </Link>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.sourceUrl}
          alt={image.altText || post.title}
          className="w-full h-64 object-cover rounded-xl mb-8"
        />
      )}

      <div className="flex gap-2 mb-4">
        {post.categories.nodes.map((cat) => (
          <Link
            key={cat.slug}
            href={`/blog/category/${cat.slug}`}
            className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-3">{date}</p>
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}
