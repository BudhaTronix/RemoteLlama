"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.28em] text-brand/80">
            OllaBridge
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold">
            Something went sideways
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {error.message || "An unexpected error interrupted the app."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-slate-950 transition hover:brightness-110"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
