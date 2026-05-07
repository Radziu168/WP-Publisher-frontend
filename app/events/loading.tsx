export default function LoadingEvents() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Wydarzenia</h1>
      <div className="grid gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-6 animate-pulse"
          >
            <div className="h-48 bg-gray-100 rounded-lg mb-4" />
            <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
