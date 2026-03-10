import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { OPS_SESSION_COOKIE_NAME, OPS_SESSION_MAX_AGE_SECONDS } from "./constants";

type OpsSessionPayload = {
  userId: number;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};

function getSessionSecret(): string {
  const secret = process.env.OPS_SESSION_SECRET;

  if (!secret) {
    throw new Error("OPS_SESSION_SECRET is required to initialize ops auth.");
  }

  if (secret.length < 32) {
    throw new Error("OPS_SESSION_SECRET must be at least 32 characters.");
  }

  return secret;
}

function encodePayload(payload: OpsSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string): OpsSessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as OpsSessionPayload;
  } catch {
    return null;
  }
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function serializeSession(payload: OpsSessionPayload): string {
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string): OpsSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  const payload = decodePayload(encodedPayload);

  if (!payload) {
    return null;
  }

  if (payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
}

export function isOpsAuthConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.OPS_SESSION_SECRET);
}

async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (isLocalHost) {
    return false;
  }

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  return true;
}

export async function createOpsSession(userId: number) {
  const now = Date.now();
  const cookieStore = await cookies();
  const secure = await shouldUseSecureCookie();
  const payload: OpsSessionPayload = {
    userId,
    nonce: randomBytes(12).toString("base64url"),
    issuedAt: now,
    expiresAt: now + OPS_SESSION_MAX_AGE_SECONDS * 1000,
  };

  cookieStore.set(OPS_SESSION_COOKIE_NAME, serializeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/ops",
    maxAge: OPS_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearOpsSession() {
  const cookieStore = await cookies();
  const secure = await shouldUseSecureCookie();
  cookieStore.set(OPS_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/ops",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function readOpsSession(): Promise<OpsSessionPayload | null> {
  if (!process.env.OPS_SESSION_SECRET) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(OPS_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
