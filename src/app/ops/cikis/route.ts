import { NextResponse } from "next/server";
import { writeAuditLogBestEffort } from "@/lib/ops/audit";
import { OPS_LOGIN_PATH } from "@/lib/ops/auth/constants";
import { clearOpsSession, readOpsSession } from "@/lib/ops/auth/session";

export async function GET() {
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

  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: OPS_LOGIN_PATH,
    },
  });
}
