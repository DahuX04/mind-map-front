import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section className="panel max-w-md p-6 text-center">
        <h1 className="text-2xl font-semibold">Pagina no encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">La ruta solicitada no existe o ya no esta disponible.</p>
        <Link className="btn btn-primary mt-5" href="/dashboard">
          Volver al dashboard
        </Link>
      </section>
    </main>
  );
}
