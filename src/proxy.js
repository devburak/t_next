import { NextResponse } from "next/server";
import seed from "./data/legacy-routes.json";
import { createLegacyRouteCache } from "./lib/legacyRoutes.mjs";

const cache = createLegacyRouteCache({ seed });
export function proxy(request, event) {
  if (
    !["GET", "HEAD"].includes(request.method) ||
    request.nextUrl.pathname === "/"
  )
    return NextResponse.next();
  // The embedded manifest makes lookup synchronous. Refresh never delays page loading.
  event.waitUntil(
    cache.refresh(
      process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
    ),
  );
  const route = cache.lookup(request.nextUrl.pathname);
  if (!route) return NextResponse.next();
  if (route.status === 301) {
    const url = new URL(route.location, request.url);
    for (const key of ["page", "periodId"])
      if (!url.searchParams.has(key) && request.nextUrl.searchParams.has(key))
        url.searchParams.set(key, request.nextUrl.searchParams.get(key));
    return NextResponse.redirect(url, 301);
  }
  return new NextResponse(
    request.method === "HEAD"
      ? null
      : '<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sayfa kaldırıldı | TMMOB</title><main style="max-width:40rem;margin:15vh auto;padding:24px;font:18px/1.6 system-ui"><h1>Bu sayfa artık yayında değil.</h1><p><a href="/">Ana sayfaya dön</a></p></main></html>',
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).+)"],
};
