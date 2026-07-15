export function LeadSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="search">
        Busca
      </label>
      <input
        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
        defaultValue={defaultValue}
        id="search"
        name="search"
        placeholder="Nome, e-mail ou telefone"
        type="search"
      />
    </div>
  );
}
