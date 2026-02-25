import { AppShell } from "@/components/app/app-shell";
import { TawkLoader } from "@/components/chat/tawk-loader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <TawkLoader />
    </>
  );
}
