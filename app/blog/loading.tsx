export default function LoadingBlog() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex gap-12">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Blog</h1>
          <div className="flex flex-col gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border-b border-gray-200 pb-8 animate-pulse"
              >
                <div className="h-52 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
        <aside className="w-56 shrink-0">
          <div className="h-6 bg-gray-100 rounded w-24 mb-4 animate-pulse" />
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
