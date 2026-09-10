export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(isoDate),
  );
}
