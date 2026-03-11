import { redirectAuthenticatedLogin } from "@/lib/ops/auth/guards";
import { canUseOpsAuthDatabase } from "@/lib/ops/auth/users";
import { isOpsAuthConfigured } from "@/lib/ops/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OpsLoginForm } from "@/components/ops/ops-login-form";

export default async function OpsLoginPage() {
  await redirectAuthenticatedLogin();

  const authReady = isOpsAuthConfigured() && canUseOpsAuthDatabase();

  return (
    <main className="app-container">
      <div className="app-section flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md space-y-5">
          <header className="space-y-2 text-center">
            <h1 className="typo-page-title">Giriş yap</h1>
            <p className="typo-p text-muted-foreground">
              Hesabınızla giriş yapın.
            </p>
          </header>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Stüdyo girişi</CardTitle>
              <CardDescription>E-posta ve şifrenizi girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authReady ? (
                <OpsLoginForm />
              ) : (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Giriş şu anda hazır değil</p>
                  <p className="mt-1">Lütfen daha sonra tekrar deneyin veya stüdyo ekibiyle görüşün.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
