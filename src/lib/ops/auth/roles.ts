import type { UserRole } from "@/db/schema/users";
import { OPS_LOGIN_PATH, OPS_STAFF_HOME_PATH, OPS_USER_HOME_PATH } from "./constants";

export type ResolvedOpsArea = "staff" | "user";

export function hasStaffRole(roles: UserRole[]): boolean {
  return roles.some((role) => role === "admin" || role === "artist");
}

export function hasUserRole(roles: UserRole[]): boolean {
  return roles.includes("user");
}

export function resolveOpsArea(roles: UserRole[]): ResolvedOpsArea | null {
  if (hasStaffRole(roles)) {
    return "staff";
  }

  if (hasUserRole(roles)) {
    return "user";
  }

  return null;
}

export function getOpsHomePath(roles: UserRole[]): string {
  const area = resolveOpsArea(roles);

  if (area === "staff") {
    return OPS_STAFF_HOME_PATH;
  }

  if (area === "user") {
    return OPS_USER_HOME_PATH;
  }

  return OPS_LOGIN_PATH;
}
