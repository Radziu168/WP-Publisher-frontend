import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Panel"',
      },
    });
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [, password] = decoded.split(":");

  if (password !== ADMIN_PASSWORD) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Panel"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
