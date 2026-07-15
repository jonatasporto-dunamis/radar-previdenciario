export default function LeadDetailLoading() {
  return (
    <main className="p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
      </div>
    </main>
  );
}
