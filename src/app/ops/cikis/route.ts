import { NextResponse } from "next/server";
import { writeAuditLogBestEffort } from "@/lib/ops/audit";
import { clearOpsSession, readOpsSession } from "@/lib/ops/auth/session";

export async function GET(request: Request) {
  const session = await readOpsSession();
  await clearOpsSession();

  if (session) {
    await writeAuditLogBestEffort({
      actorUserId: session.userId,
      action: "ops_auth.logged_out",
      entityType: "ops_session",
      entityId: session.userId,
      payload: {
        area: "ops",
      },
    });
  }

  return NextResponse.redirect(new URL("/ops/giris", request.url), 303);
}
