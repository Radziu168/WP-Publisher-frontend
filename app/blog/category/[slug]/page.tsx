import { fetchGraphQL } from "@/lib/graphql";
import { GET_CATEGORIES } from "@/lib/queries";
import { Post, Category } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const GET_POSTS_BY_CATEGORY = `
query GetPostsByCategory($slug: String!) {
  posts(where: { categoryName: $slug, status: PUBLISH }) {
    nodes {
      id
      title
      slug
      date
      excerpt
      categories {
        nodes {
          name
          slug
        }
      }
    }
  }
  categories(where: { slug: [$slug] }) {
    nodes {
      name
      slug
    }
  }
}
`;

export async function generateStaticParams() {
  const data = await fetchGraphQL(GET_CATEGORIES);
  return data.categories.nodes.map((cat: Category) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchGraphQL(GET_POSTS_BY_CATEGORY, { slug });

  const posts: Post[] = data.posts.nodes;
  const category = data.categories.nodes[0];

  if (!category) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="text-blue-600 text-sm hover:underline mb-8 inline-block"
      >
        ← Powrót do bloga
      </Link>

      <h1 className="text-3xl font-bold mb-2">Kategoria: {category.name}</h1>
      <p className="text-gray-400 text-sm mb-8">{posts.length} postów</p>

      <div className="flex flex-col gap-8">
        {posts.length === 0 && (
          <p className="text-gray-500">Brak postów w tej kategorii.</p>
        )}
        {posts.map((post) => {
          const date = new Date(post.date).toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <article key={post.id} className="border-b border-gray-200 pb-8">
              <p className="text-sm text-gray-400 mb-2">{date}</p>
              <h2 className="text-xl font-bold mb-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <div
                className="text-gray-600 text-sm line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline"
              >
                Czytaj więcej →
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
