import { Bell, Gauge, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const items = [
    { icon: ShieldCheck, title: "Seguridad", description: "La autorizacion final queda en el backend con Supabase JWT." },
    { icon: Gauge, title: "Rendimiento", description: "Canvas con acciones explicitas para layout y minimapa configurable." },
    { icon: Bell, title: "Telemetria", description: "Eventos clave preparados sin registrar contenido sensible." },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-teal-700">Ajustes</p>
        <h1 className="mt-1 text-3xl font-semibold">Preferencias del MVP</h1>
        <p className="mt-2 text-sm text-slate-500">Configuracion local y recordatorios de integracion.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="panel p-4">
              <Icon className="size-5 text-teal-700" aria-hidden />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
