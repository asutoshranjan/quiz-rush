import { NextRequest, NextResponse } from "next/server";

// Logout API handler
export async function GET(req: NextRequest) {
  if (req.method == "GET") {

    // make sure the session cookie is cleared and not cached
    const response = NextResponse.json({ success: true }, { 
      status: 200, 
      headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },});

    

    // Clear the session cookie by setting an expired date
    response.cookies.set({
      name: "session",
      value: "",
      httpOnly: true,
      expires: new Date(0), // Immediately expires the cookie
      path: "/", // Ensure the cookie is removed from the root path
    });

    return response;
  } else {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }
}
