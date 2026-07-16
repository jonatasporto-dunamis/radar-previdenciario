import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";

const roles = new Set(["admin", "manager", "agent", "viewer"]);

function readArg(name) {
  const prefix = `--${name}=`;
  return process.argv
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

const email = readArg("email")?.trim().toLowerCase();
const tenantSlug = readArg("tenant")?.trim();
const role = readArg("role")?.trim() ?? "agent";
const confirmed = process.argv.includes("--yes");

if (!email || !tenantSlug || !roles.has(role)) {
  console.error(
    "Uso: pnpm office:grant-access --email=user@example.com --tenant=resende-advogados --role=admin --yes",
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

if (!confirmed) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `Confirmar acesso ${role} para ${email} no tenant ${tenantSlug}? Digite CONFIRMAR: `,
  );
  rl.close();

  if (answer !== "CONFIRMAR") {
    console.error("Operação cancelada.");
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: users, error: userError } = await supabase.auth.admin.listUsers();

if (userError) {
  console.error("Não foi possível consultar usuários do Supabase Auth.");
  process.exit(1);
}

const user = users.users.find((item) => item.email?.toLowerCase() === email);

if (!user) {
  console.error(
    "Usuário não encontrado. Crie o usuário manualmente no Supabase Auth.",
  );
  process.exit(1);
}

const { data: tenant, error: tenantError } = await supabase
  .from("tenants")
  .select("id, slug, status")
  .eq("slug", tenantSlug)
  .maybeSingle();

if (tenantError || !tenant) {
  console.error("Tenant não encontrado.");
  process.exit(1);
}

if (tenant.status !== "active") {
  console.error("Tenant não está ativo.");
  process.exit(1);
}

const { error: upsertError } = await supabase.from("tenant_memberships").upsert(
  {
    tenant_id: tenant.id,
    user_id: user.id,
    role,
    status: "active",
    is_default: true,
  },
  { onConflict: "tenant_id,user_id" },
);

if (upsertError) {
  console.error("Não foi possível gravar a membership.");
  process.exit(1);
}

console.log("Membership atualizada com sucesso.");
