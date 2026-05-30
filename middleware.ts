import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(req: NextRequest) {
  // Đã phân tách: User dùng 'user_token', Admin dùng 'token'
  const userToken = req.cookies.get("user_token")?.value;
  const adminToken = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const now = Date.now() / 1000;

  // ================= ROOT "/" =================
  if (pathname === "/") {
    // Ưu tiên User
    if (userToken) {
      try {
        const decoded: any = jwtDecode(userToken);
        if (decoded.role === "user" && (!decoded.exp || decoded.exp > now)) {
          return NextResponse.redirect(new URL("/home", req.url));
        }
      } catch {}
    }

    // Nếu không có User nhưng có Admin
    if (adminToken) {
      try {
        const decoded: any = jwtDecode(adminToken);
        if (decoded.role === "admin" && (!decoded.exp || decoded.exp > now)) {
          return NextResponse.redirect(new URL(decoded.mustChangePassword ? "/admin/change-password" : "/admin/dashboard", req.url));
        }
      } catch {}
    }

    return NextResponse.redirect(new URL("/browse", req.url));
  }

  // ================= ADMIN =================
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (adminToken) {
        try {
          const decoded: any = jwtDecode(adminToken);
          if (decoded.role === "admin" && (!decoded.exp || decoded.exp > now)) {
            return NextResponse.redirect(new URL(decoded.mustChangePassword ? "/admin/change-password" : "/admin/dashboard", req.url));
          }
        } catch {}
      }
      return NextResponse.next();
    }

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const decoded: any = jwtDecode(adminToken);
      if (decoded.role !== "admin" || (decoded.exp && decoded.exp < now)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (decoded.mustChangePassword && pathname !== "/admin/change-password") {
        return NextResponse.redirect(new URL("/admin/change-password", req.url));
      }
      if (!decoded.mustChangePassword && pathname === "/admin/change-password") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ================= USER =================
  if (pathname === "/register" || pathname === "/browse" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (userToken) {
      try {
        const decoded: any = jwtDecode(userToken);
        if (decoded.role === "user" && (!decoded.exp || decoded.exp > now)) {
          return NextResponse.redirect(new URL("/home", req.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/profile")) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      const decoded: any = jwtDecode(userToken);
      if (decoded.role !== "user" || (decoded.exp && decoded.exp < now)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/home")) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded: any = jwtDecode(userToken);
      if (decoded.role !== "user" || (decoded.exp && decoded.exp < now)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/home/:path*", "/login", "/register", "/browse", "/profile/:path*"],
};
