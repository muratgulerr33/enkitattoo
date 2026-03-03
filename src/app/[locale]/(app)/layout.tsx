import { AppShell } from "@/components/app/app-shell";
import { locales } from "@/i18n/routing";
import { getLocaleOrderFromAcceptLanguage } from "@/lib/i18n/locale-order";
import { NextIntlClientProvider } from "next-intl";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const requestHeaders = await headers();
  const initialLocaleOrder = getLocaleOrderFromAcceptLanguage(requestHeaders.get("accept-language"));

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Istanbul"
    >
      <AppShell initialLocaleOrder={initialLocaleOrder}>{children}</AppShell>
    </NextIntlClientProvider>
  );
}
