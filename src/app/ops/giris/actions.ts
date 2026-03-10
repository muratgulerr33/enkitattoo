"use server";

import { redirect } from "next/navigation";
import { createOpsSession, isOpsAuthConfigured } from "@/lib/ops/auth/session";
import { verifyPassword } from "@/lib/ops/auth/password";
import { getOpsHomePath } from "@/lib/ops/auth/roles";
import { canUseOpsAuthDatabase, findOpsUserByEmail } from "@/lib/ops/auth/users";
import { writeAuditLogBestEffort } from "@/lib/ops/audit";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!isOpsAuthConfigured() || !canUseOpsAuthDatabase()) {
    return {
      error: "Ops giris kurulumu eksik. Env ve veritabani baglantisini kontrol edin.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "E-posta ve sifre gerekli.",
    };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      error: "E-posta ve sifre gerekli.",
    };
  }

  const user = await findOpsUserByEmail(trimmedEmail);

  if (!user || !user.isActive || !user.passwordHash) {
    return {
      error: "E-posta veya sifre hatali.",
    };
  }

  const passwordValid = await verifyPassword(trimmedPassword, user.passwordHash);

  if (!passwordValid) {
    return {
      error: "E-posta veya sifre hatali.",
    };
  }

  const nextPath = getOpsHomePath(user.roles);

  if (nextPath === "/ops/giris") {
    return {
      error: "Bu hesap icin ops erisimi tanimli degil.",
    };
  }

  await createOpsSession(user.id);
  await writeAuditLogBestEffort({
    actorUserId: user.id,
    action: "ops_auth.logged_in",
    entityType: "ops_session",
    entityId: user.id,
    payload: {
      area: "ops",
      roles: user.roles,
    },
  });
  redirect(nextPath);
}
