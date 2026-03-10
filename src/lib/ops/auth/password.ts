import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

function encodeBuffer(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function decodeBuffer(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return [HASH_PREFIX, encodeBuffer(salt), encodeBuffer(derivedKey)].join(":");
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [prefix, saltValue, derivedKeyValue] = passwordHash.split(":");

  if (prefix !== HASH_PREFIX || !saltValue || !derivedKeyValue) {
    return false;
  }

  const salt = decodeBuffer(saltValue);
  const expected = decodeBuffer(derivedKeyValue);
  const candidate = (await scrypt(password, salt, expected.length)) as Buffer;

  if (candidate.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(candidate, expected);
}
