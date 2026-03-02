import { RootLocaleReplace } from "@/components/app/root-locale-replace";
import { getLocaleOrderFromAcceptLanguage } from "@/lib/i18n/locale-order";
import { headers } from "next/headers";

export default async function RootPage() {
  const requestHeaders = await headers();
  const [preferredLocale] = getLocaleOrderFromAcceptLanguage(requestHeaders.get("accept-language"));

  return <RootLocaleReplace locale={preferredLocale ?? "tr"} />;
}
