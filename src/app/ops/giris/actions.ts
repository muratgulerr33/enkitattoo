"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createOpsSession, isOpsAuthConfigured } from "@/lib/ops/auth/session";
import { hashPassword, verifyPassword } from "@/lib/ops/auth/password";
import { getOpsHomePath } from "@/lib/ops/auth/roles";
import {
  canUseOpsAuthDatabase,
  findOpsUserByEmail,
  normalizeEmail,
} from "@/lib/ops/auth/users";
import { writeAuditLogBestEffort } from "@/lib/ops/audit";
import { createCustomerRecord } from "@/lib/ops/customers";

export type LoginActionState = {
  error: string | null;
};

export type CustomerRegisterActionState = {
  error: string | null;
};

function emptyToNull(value: FormDataEntryValue | null, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("Girdiler beklenenden uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function isPhoneValid(phone: string): boolean {
  return /^[0-9+\s()\-]{7,32}$/.test(phone);
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!isOpsAuthConfigured() || !canUseOpsAuthDatabase()) {
    return {
      error: "Giriş şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "E-posta ve şifre gerekli.",
    };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      error: "E-posta ve şifre gerekli.",
    };
  }

  const user = await findOpsUserByEmail(trimmedEmail);

  if (!user || !user.isActive || !user.passwordHash) {
    return {
      error: "E-posta veya şifre hatalı.",
    };
  }

  const passwordValid = await verifyPassword(trimmedPassword, user.passwordHash);

  if (!passwordValid) {
    return {
      error: "E-posta veya şifre hatalı.",
    };
  }

  const nextPath = getOpsHomePath(user.roles);

  if (nextPath === "/ops/giris") {
    return {
      error: "Bu hesap için ops erişimi tanımlı değil.",
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

export async function registerCustomerAccountAction(
  _previousState: CustomerRegisterActionState,
  formData: FormData
): Promise<CustomerRegisterActionState> {
  if (!isOpsAuthConfigured() || !canUseOpsAuthDatabase()) {
    return {
      error: "Hesap akışı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
    };
  }

  try {
    const fullName = emptyToNull(formData.get("fullName"), 160);
    const phone = emptyToNull(formData.get("phone"), 32);
    const email = emptyToNull(formData.get("email"), 320);
    const password = emptyToNull(formData.get("password"), 160);

    if (!fullName) {
      return {
        error: "Ad soyad gerekli.",
      };
    }

    if (!phone) {
      return {
        error: "Telefon gerekli.",
      };
    }

    if (!isPhoneValid(phone)) {
      return {
        error: "Telefon bilgisini daha sade yazın.",
      };
    }

    if (!email) {
      return {
        error: "E-posta gerekli.",
      };
    }

    if (!isEmailValid(email)) {
      return {
        error: "Geçerli bir e-posta yazın.",
      };
    }

    if (!password) {
      return {
        error: "Şifre gerekli.",
      };
    }

    if (password.length < 8) {
      return {
        error: "Şifre en az 8 karakter olmalı.",
      };
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await findOpsUserByEmail(normalizedEmail);

    if (existingUser) {
      return {
        error: "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.",
      };
    }

    const passwordHash = await hashPassword(password);
    const customer = await createCustomerRecord({
      email: normalizedEmail,
      passwordHash,
      phone,
      fullName,
    });

    await createOpsSession(customer.userId);
    revalidatePath("/ops/staff/musteriler");
    revalidatePath("/ops/staff/randevular");
    redirect("/ops/user/onaylar");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Hesap oluşturulamadı.",
    };
  }
}
