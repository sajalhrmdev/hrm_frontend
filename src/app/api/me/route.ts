// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function GET() {
//   const token =  cookies().get("token")?.value;

//   if (!token) {
//     return NextResponse.json({ user: null }, { status: 401 });
//   }

//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await res.json();

//   return NextResponse.json(data);
// }