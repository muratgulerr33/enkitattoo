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
      <div className="app-section flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md space-y-5">
          <header className="space-y-2 text-center">
            <h1 className="typo-page-title">
              {showRegister ? "Müşteri hesabı oluştur" : "Hesabınıza giriş yapın"}
            </h1>
            <p className="typo-p text-muted-foreground">
              Randevu, profil ve form akışınızı hesabınızla yönetin.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface-1 p-1">
            <Button
              asChild
              variant={showRegister ? "ghost" : "default"}
              className="w-full rounded-xl"
            >
              <Link href="/ops/giris">Giriş Yap</Link>
            </Button>
            <Button
              asChild
              variant={showRegister ? "default" : "ghost"}
              className="w-full rounded-xl"
            >
              <Link href="/ops/giris?kayit=1">Kayıt Ol</Link>
            </Button>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {showRegister ? "Yeni müşteri hesabı" : "Hesap girişi"}
              </CardTitle>
              <CardDescription>
                {showRegister
                  ? "Ad soyad, telefon, e-posta ve şifre ile hesabınızı oluşturun."
                  : "E-posta ve şifrenizle hesabınıza girin."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            Stüdyo ekibi de aynı giriş ekranını kullanır.
          </p>
        </div>
      </div>
    </main>
  );
}
