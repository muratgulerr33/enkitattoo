import { NextResponse } from "next/server";
import { clearOpsSession } from "@/lib/ops/auth/session";

export async function GET(request: Request) {
  await clearOpsSession();
  return NextResponse.redirect(new URL("/ops/giris", request.url), 303);
}
