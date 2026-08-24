import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSiteUrl } from "@/lib/seo";

export default auth((request) => {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && request.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", getSiteUrl()));
  }

  if (isLoginRoute && request.auth?.user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", getSiteUrl()));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
