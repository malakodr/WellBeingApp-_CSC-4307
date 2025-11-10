export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in-up">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 text-6xl">🚧</div>
        <h1 className="text-4xl font-bold text-text mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">
          This page is currently under development. Check back soon!
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
