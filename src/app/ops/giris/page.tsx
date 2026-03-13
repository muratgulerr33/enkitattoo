import { redirectAuthenticatedLogin } from "@/lib/ops/auth/guards";
import { canUseOpsAuthDatabase } from "@/lib/ops/auth/users";
import { isOpsAuthConfigured } from "@/lib/ops/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <div className="flex min-h-[100svh] items-start justify-center py-5 sm:py-8 md:items-center md:py-10">
        <div className="w-full max-w-md space-y-4 sm:space-y-5">
          <header className="space-y-1 px-1 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Enki Tattoo Ops
            </p>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {showRegister ? "Müşteri hesabı oluştur" : "Hesabına giriş yap"}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-surface-1 p-1">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "h-11 rounded-xl border text-sm",
                showRegister
                  ? "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  : "border-border bg-background shadow-xs hover:bg-background"
              )}
            >
              <Link href="/ops/giris" aria-current={showRegister ? undefined : "page"}>
                Giriş Yap
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "h-11 rounded-xl border text-sm",
                showRegister
                  ? "border-border bg-background shadow-xs hover:bg-background"
                  : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
            >
              <Link href="/ops/giris?kayit=1" aria-current={showRegister ? "page" : undefined}>
                Kayıt Ol
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
              <CardTitle className="text-lg">
                {showRegister ? "Yeni müşteri hesabı" : "Hesap girişi"}
              </CardTitle>
              <CardDescription>
                {showRegister
                  ? "Hesabını aç. Sonra profil, form ve randevu akışına devam et."
                  : "E-posta ve şifrenle giriş yapıp kaldığın adımdan devam et."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              {authReady ? (
                showRegister ? <OpsCustomerRegisterForm /> : <OpsLoginForm />
              ) : (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Hesap akışı şu anda hazır değil</p>
                  <p className="mt-1">Lütfen daha sonra tekrar deneyin veya stüdyo ekibiyle görüşün.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Ekip girişi de aynı ekrandan yapılır.
          </p>
        </div>
      </div>
    </main>
  );
}
