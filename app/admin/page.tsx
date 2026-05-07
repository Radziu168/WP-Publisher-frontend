import { approvePost, rejectPost } from "./actions";

interface WPPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  acf: {
    event_date?: string;
    page_banner_subtitle?: string;
  };
}

async function getDrafts(): Promise<WPPost[]> {
  const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
  const WP_USERNAME = process.env.WP_USERNAME;
  const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
  const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
    "base64",
  );

  const response = await fetch(
    `${WP_URL}/wp-json/wp/v2/event?status=draft&per_page=20`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: "no-store",
    },
  );

  if (!response.ok) return [];
  return response.json();
}

function formatACFDate(acfDate: string | undefined): string {
  if (!acfDate) return "Brak daty";
  // ACF date format: YYYYMMDD
  const y = acfDate.slice(0, 4);
  const m = acfDate.slice(4, 6);
  const d = acfDate.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const drafts = await getDrafts();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel Admina</h1>
          <p className="text-gray-500 text-sm mt-1">
            Drafty eventów do zatwierdzenia
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
          {drafts.length} draftów
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">✓</p>
          <p className="text-lg">Brak draftów do zatwierdzenia</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      draft
                    </span>
                    <span className="text-xs text-gray-400">ID: {post.id}</span>
                    <span className="text-xs text-gray-400">
                      📅 {formatACFDate(post.acf?.event_date)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold mb-1">
                    {post.title.rendered}
                  </h2>

                  {post.acf?.page_banner_subtitle && (
                    <p className="text-sm text-blue-600 mb-2">
                      {post.acf.page_banner_subtitle}
                    </p>
                  )}

                  <div
                    className="text-sm text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <form action={approvePost.bind(null, post.id)}>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Zatwierdź
                    </button>
                  </form>
                  <form action={rejectPost.bind(null, post.id)}>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                      ✕ Odrzuć
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
