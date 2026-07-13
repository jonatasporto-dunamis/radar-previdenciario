import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseE2EAdminClient } from "./e2e-admin-client";
import type { Database } from "@/types/supabase";

export function createSupabaseAdminClient() {
  if (process.env.E2E_MOCK_SUPABASE === "true") {
    return createSupabaseE2EAdminClient() as unknown as ReturnType<
      typeof createClient<Database>
    >;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL for Supabase admin client.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY for Supabase admin client.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
