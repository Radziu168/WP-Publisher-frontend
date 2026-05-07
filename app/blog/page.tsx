import { fetchGraphQL } from "@/lib/graphql";
import { GET_POSTS, GET_CATEGORIES } from "@/lib/queries";
import { Post, Category } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [postsData, categoriesData] = await Promise.all([
    fetchGraphQL(GET_POSTS, {}, { revalidate: 300, tags: ["posts"] }),
    fetchGraphQL(
      GET_CATEGORIES,
      {},
      { revalidate: 3600, tags: ["categories"] },
    ),
  ]);

  const posts: Post[] = postsData.posts.nodes;
  const categories: Category[] = categoriesData.categories.nodes.filter(
    (cat: Category) => cat.count && cat.count > 0,
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex gap-12">
        {/* Lista postów */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Blog</h1>
          <div className="flex flex-col gap-8">
            {posts.map((post) => {
              const image = post.featuredImage?.node;
              const date = new Date(post.date).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <article
                  key={post.id}
                  className="border-b border-gray-200 pb-8"
                >
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.sourceUrl}
                      alt={image.altText || post.title}
                      className="w-full h-52 object-cover rounded-xl mb-4"
                    />
                  )}
                  <div className="flex gap-2 mb-2">
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
        </div>

        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <h2 className="text-lg font-bold mb-4">Kategorie</h2>
          <ul className="flex flex-col gap-2">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/blog/category/${cat.slug}`}
                  className="flex justify-between items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span>{cat.name}</span>
                  <span className="text-gray-400">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold mb-4">Wydarzenia</h2>
            <Link
              href="/events"
              className="text-sm text-blue-600 hover:underline"
            >
              Zobacz wszystkie →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
