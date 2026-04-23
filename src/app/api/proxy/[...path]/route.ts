// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// async function handler(req: Request, context: any) {
//   try {
//     // ✅ cookies fix
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     // ✅ FINAL FIX: await params
//     const params = await context.params;
//     const path = params.path;

//     const url = `${BASE_URL}/api/v1/${path.join("/")}`;

//     let body: any = null;
//     if (req.method !== "GET") {
//       try {
//         body = await req.json();
//       } catch {
//         body = null;
//       }
//     }

//     const backendRes = await fetch(url, {
//       method: req.method,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       ...(body && { body: JSON.stringify(body) }),
//     });

//     const data = await backendRes.json();
// console.log("TOKEN:", token);
//     return NextResponse.json(data, {
//       status: backendRes.status,
//     });
//   } catch (error) {
//     console.error("PROXY ERROR:", error);
    

//     return NextResponse.json(
//       { message: "Proxy error" },
//       { status: 500 }
//     );
//   }
// }

// // methods
// export async function GET(req: Request, context: any) {
//   return handler(req, context);
// }

// export async function POST(req: Request, context: any) {
//   return handler(req, context);
// }

// export async function PUT(req: Request, context: any) {
//   return handler(req, context);
// }

// export async function DELETE(req: Request, context: any) {
//   return handler(req, context);
// }

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handler(req: Request, context: any) {
  try {
    // ✅ cookies (Next.js 15)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // 🔥 companyId (cookie + fallback header)
    const companyId =
      cookieStore.get("companyId")?.value ||
      req.headers.get("x-company-id");

    // ✅ params fix
    const params = await context.params;
    const path = params.path;

    const url = `${BASE_URL}/api/v1/${path.join("/")}`;

    // ✅ body handle
    let body: any = null;
    if (req.method !== "GET") {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    // 🚀 backend call
    const backendRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(companyId && { "x-company-id": companyId }), // 🔥 AUTO ADD
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await backendRes.json();

    // 🔍 debug (remove in production)
    console.log("TOKEN:", token);
    console.log("COMPANY:", companyId);
    console.log("URL:", url);

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("PROXY ERROR:", error);

    return NextResponse.json(
      { message: "Proxy error" },
      { status: 500 }
    );
  }
}

// ✅ ALL METHODS
export async function GET(req: Request, context: any) {
  return handler(req, context);
}

export async function POST(req: Request, context: any) {
  return handler(req, context);
}

export async function PUT(req: Request, context: any) {
  return handler(req, context);
}

export async function DELETE(req: Request, context: any) {
  return handler(req, context);
}