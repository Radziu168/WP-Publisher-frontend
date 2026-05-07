"use client";

export default function EventsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold mb-2">Błąd ładowania wydarzeń</h2>
      <p className="text-gray-500 text-sm mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        Spróbuj ponownie
      </button>
    </main>
  );
}
