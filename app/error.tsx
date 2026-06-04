"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section className="panel max-w-lg p-6">
        <h1 className="text-2xl font-semibold">Algo salio mal</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{error.message}</p>
        <button className="btn btn-primary mt-5" type="button" onClick={reset}>
          Reintentar
        </button>
      </section>
    </main>
  );
}
