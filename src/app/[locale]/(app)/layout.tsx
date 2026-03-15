import { AppShell } from "@/components/app/app-shell";
import { locales } from "@/i18n/routing";
import { DEFAULT_LOCALE_ORDER } from "@/lib/i18n/locale-order";
import { NextIntlClientProvider } from "next-intl";
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

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Istanbul"
    >
      <AppShell initialLocaleOrder={DEFAULT_LOCALE_ORDER}>{children}</AppShell>
    </NextIntlClientProvider>
  );
}
