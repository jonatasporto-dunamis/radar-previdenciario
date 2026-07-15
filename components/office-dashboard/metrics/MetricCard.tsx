export function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="bg-card rounded-lg border p-5 shadow-sm">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-2 text-xs">{description}</p>
    </article>
  );
}
