import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

const PHONE_INPUT_PATTERN = /^[0-9+\s()\-]{7,32}$/;

export function isPhoneValid(phone: string): boolean {
  return PHONE_INPUT_PATTERN.test(phone);
}

export function normalizePhoneForMatching(phone: string): string | null {
  const digits = phone.replace(/\D+/g, "");

  if (!digits) {
    return null;
  }

  if (/^0090\d{10}$/.test(digits)) {
    return `0${digits.slice(-10)}`;
  }

  if (/^90\d{10}$/.test(digits)) {
    return `0${digits.slice(-10)}`;
  }

  if (/^\d{10}$/.test(digits)) {
    return `0${digits}`;
  }

  return digits;
}

export function getNormalizedPhoneSql(column: AnyPgColumn) {
  const digitsSql = sql<string>`regexp_replace(coalesce(${column}, ''), '[^0-9]+', '', 'g')`;

  return sql<string | null>`
    case
      when ${digitsSql} = '' then null
      when ${digitsSql} ~ '^0090[0-9]{10}$' then '0' || right(${digitsSql}, 10)
      when ${digitsSql} ~ '^90[0-9]{10}$' then '0' || right(${digitsSql}, 10)
      when ${digitsSql} ~ '^[0-9]{10}$' then '0' || ${digitsSql}
      else ${digitsSql}
    end
  `;
}
