import { redirectAuthenticatedLogin } from "@/lib/ops/auth/guards";
import { canUseOpsAuthDatabase } from "@/lib/ops/auth/users";
import { isOpsAuthConfigured } from "@/lib/ops/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { OpsCustomerRegisterForm } from "@/components/ops/ops-customer-register-form";
import { OpsLoginForm } from "@/components/ops/ops-login-form";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    kayit?: string;
  }>;
};

export default async function OpsLoginPage({ searchParams }: PageProps) {
  await redirectAuthenticatedLogin();
  const params = await searchParams;

  const authReady = isOpsAuthConfigured() && canUseOpsAuthDatabase();
  const showRegister = params.kayit === "1";

  return (
    <main className="app-container">
      <div className="flex min-h-[100svh] items-start justify-center py-4 sm:py-6 md:items-center md:py-8">
        <div className="w-full max-w-md space-y-3 sm:space-y-3.5">
          <header className="space-y-1 px-1 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Enki Tattoo Ops
            </p>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {showRegister ? "Hesap oluştur" : "Giriş yap"}
            </p>
            {!showRegister ? (
              <p className="text-sm text-muted-foreground">
                Telefon veya e-posta ile tek ekrandan giriş yapın.
              </p>
            ) : null}
          </header>

          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface-1 p-1">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "h-10 rounded-xl border text-sm",
                showRegister
                  ? "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  : "border-border bg-background shadow-xs hover:bg-background"
              )}
            >
              <Link href="/ops/giris" aria-current={showRegister ? undefined : "page"}>
                Giriş yap
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "h-10 rounded-xl border text-sm",
                showRegister
                  ? "border-border bg-background shadow-xs hover:bg-background"
                  : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
            >
              <Link href="/ops/giris?kayit=1" aria-current={showRegister ? "page" : undefined}>
                Hesap oluştur
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden border-border bg-card">
            <CardContent className="space-y-3 px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
              {authReady ? (
                showRegister ? <OpsCustomerRegisterForm /> : <OpsLoginForm />
              ) : (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Hesap alanı şu an kapalı.</p>
                  <p className="mt-1">Biraz sonra tekrar dene.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
