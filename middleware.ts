import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const publicPanelPaths = [
  "/painel/login",
  "/painel/recuperar-senha",
  "/painel/redefinir-senha",
];

function isPublicPanelPath(pathname: string): boolean {
  return publicPanelPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPanelPath = pathname === "/painel" || pathname.startsWith("/painel/");
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-radar-pathname", pathname);
  forwardedHeaders.set("x-radar-search", request.nextUrl.search);

  if (!isPanelPath && request.nextUrl.pathname !== "/auth/callback") {
    return NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    });
  }

  if (process.env.E2E_MOCK_SUPABASE === "true") {
    const hasMockSession = Boolean(
      request.cookies.get("rp_office_e2e_user_id")?.value,
    );

    if (isPanelPath && !isPublicPanelPath(pathname) && !hasMockSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/painel/login";
      url.searchParams.set("next", pathname);

      return NextResponse.redirect(url);
    }

    const response = NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    });
    if (isPanelPath) {
      response.headers.set("x-robots-tag", "noindex, nofollow");
      response.headers.set("cache-control", "no-store");
    }

    return response;
  }

  const { response, user } = await updateSupabaseSession(
    request,
    forwardedHeaders,
  );

  if (isPanelPath && !isPublicPanelPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/login";
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  if (isPanelPath) {
    response.headers.set("x-robots-tag", "noindex, nofollow");
    response.headers.set("cache-control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
