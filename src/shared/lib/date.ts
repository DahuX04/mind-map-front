export function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
