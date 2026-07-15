import { NextResponse } from "next/server";
import { createSupabaseAuthServerClient } from "@/lib/supabase/server";

function getSafeRedirectUrl(request: Request, nextPath: string | null) {
  const url = new URL(request.url);
  const target = nextPath?.startsWith("/painel") ? nextPath : "/painel";

  url.pathname = target;
  url.search = "";

  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseAuthServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(getSafeRedirectUrl(request, next));
}
