import { redirect } from "next/navigation";
import type { UserRole } from "@/db/schema/users";
import {
  OPS_LOGIN_PATH,
  OPS_STAFF_HOME_PATH,
  OPS_USER_HOME_PATH,
} from "./constants";
import { getOpsHomePath, hasStaffRole, hasUserRole } from "./roles";
import { isOpsAuthConfigured, readOpsSession } from "./session";
import { canUseOpsAuthDatabase, findOpsUserById } from "./users";

export type OpsSessionUser = {
  id: number;
  email: string | null;
  displayName: string | null;
  fullName: string | null;
  roles: UserRole[];
};

export type OpsSessionAreaAccessResult =
  | {
      ok: true;
      user: OpsSessionUser;
    }
  | {
      ok: false;
      reason: "unauthenticated" | "unauthorized";
      redirectPath: string;
    };

function toSessionUser(user: Awaited<ReturnType<typeof findOpsUserById>>): OpsSessionUser | null {
  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    fullName: user.fullName,
    roles: user.roles,
  };
}

export async function getOpsSessionUser(): Promise<OpsSessionUser | null> {
  if (!isOpsAuthConfigured() || !canUseOpsAuthDatabase()) {
    return null;
  }

  const session = await readOpsSession();

  if (!session) {
    return null;
  }

  const user = await findOpsUserById(session.userId);
  const sessionUser = toSessionUser(user);

  if (!sessionUser) {
    return null;
  }

  return sessionUser;
}

export async function requireOpsSessionArea(area: "staff" | "user"): Promise<OpsSessionUser> {
  const access = await getOpsSessionAreaAccess(area);

  if (!access.ok) {
    redirect(access.redirectPath);
  }

  return access.user;
}

export async function getOpsSessionAreaAccess(
  area: "staff" | "user"
): Promise<OpsSessionAreaAccessResult> {
  const sessionUser = await getOpsSessionUser();

  if (!sessionUser) {
    return {
      ok: false,
      reason: "unauthenticated",
      redirectPath: OPS_LOGIN_PATH,
    };
  }

  if (area === "staff") {
    if (!hasStaffRole(sessionUser.roles)) {
      return {
        ok: false,
        reason: "unauthorized",
        redirectPath: getOpsHomePath(sessionUser.roles),
      };
    }

    return {
      ok: true,
      user: sessionUser,
    };
  }

  if (hasStaffRole(sessionUser.roles)) {
    return {
      ok: false,
      reason: "unauthorized",
      redirectPath: OPS_STAFF_HOME_PATH,
    };
  }

  if (!hasUserRole(sessionUser.roles)) {
    return {
      ok: false,
      reason: "unauthenticated",
      redirectPath: OPS_LOGIN_PATH,
    };
  }

  return {
    ok: true,
    user: sessionUser,
  };
}

export async function redirectFromOpsEntry() {
  const sessionUser = await getOpsSessionUser();

  if (!sessionUser) {
    redirect(OPS_LOGIN_PATH);
  }

  redirect(getOpsHomePath(sessionUser.roles));
}

export async function redirectAuthenticatedLogin() {
  const sessionUser = await getOpsSessionUser();

  if (sessionUser) {
    redirect(getOpsHomePath(sessionUser.roles));
  }
}

export function getUnauthorizedRedirect(roles: UserRole[]): string {
  if (hasStaffRole(roles)) {
    return OPS_STAFF_HOME_PATH;
  }

  if (hasUserRole(roles)) {
    return OPS_USER_HOME_PATH;
  }

  return OPS_LOGIN_PATH;
}
