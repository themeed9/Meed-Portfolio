import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((request) => {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && request.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginRoute && request.auth?.user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
