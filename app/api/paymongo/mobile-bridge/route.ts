import { NextRequest, NextResponse } from "next/server";

/**
 * PayMongo requires `return_url` to be a valid http(s) URL — it rejects a
 * custom scheme like `pasakja://payment-return` outright. This route is
 * that http(s) return_url; it just bounces the browser on into the mobile
 * app's deep link once GCash redirects back here.
 */
export async function GET(req: NextRequest) {
  const pi = req.nextUrl.searchParams.get("pi");
  const deepLink = `pasakja://payment-return${pi ? `?pi=${encodeURIComponent(pi)}` : ""}`;
  return NextResponse.redirect(deepLink);
}
