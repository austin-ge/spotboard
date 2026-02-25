export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Spotboard</h1>
      <p className="text-gray-500 mb-8">The community skydiving winds &amp; spotting tool.</p>
      <div className="flex gap-4">
        <a href="/login" className="px-4 py-2 bg-black text-white rounded-lg">Sign in</a>
        <a href="/signup" className="px-4 py-2 border border-gray-300 rounded-lg">Create account</a>
      </div>
    </main>
  );
}
