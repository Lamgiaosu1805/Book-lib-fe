import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ================= ROOT "/" =================
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded: any = jwtDecode(token);

      if (decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      if (decoded.role === "user") {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ================= ADMIN =================
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);

          if (decoded.role === "admin") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
          }
        } catch {}
      }

      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const decoded: any = jwtDecode(token);

      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ================= USER =================
  if (pathname === "/login") {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        if (decoded.role === "user") {
          return NextResponse.redirect(new URL("/home", req.url));
        }

        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
      } catch {}
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/home")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded: any = jwtDecode(token);

      if (decoded.role !== "user") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/home/:path*", "/login"],
};
