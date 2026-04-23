import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔥 Backend call
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();

    // ❌ backend error handle
    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Login failed" },
        { status: backendRes.status }
      );
    }

    // ✅ response create
    const response = NextResponse.json({
      message: data.message,
      user: data.user,
    });

   // 🔥 TOKEN COOKIE
response.cookies.set("token", data.token, {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

// 🔥 COMPANY COOKIE (NEW)
const companyId = data.user?.memberships?.[0]?.companyId;

if (companyId) {
  response.cookies.set("companyId", companyId, {
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


