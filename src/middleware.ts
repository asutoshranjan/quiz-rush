import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./auth-utils";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}