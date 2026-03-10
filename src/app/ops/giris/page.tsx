import { redirectAuthenticatedLogin } from "@/lib/ops/auth/guards";
import { canUseOpsAuthDatabase } from "@/lib/ops/auth/users";
import { isOpsAuthConfigured } from "@/lib/ops/auth/session";
import { Badge } from "@/components/ui/badge";
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
        <div className="w-full max-w-md space-y-6">
          <header className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
              Enki Studio Operations
            </Badge>
            <div className="space-y-2">
              <h1 className="typo-page-title">Ops giris</h1>
              <p className="typo-p text-muted-foreground">
                Hesabinizla giris yapin. Rolunuze gore dogru ops alanina yonlendirilirsiniz.
              </p>
            </div>
          </header>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Giris</CardTitle>
              <CardDescription>
                TR-only ops auth akisi public auth veya i18n zincirine bagli degildir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authReady ? (
                <OpsLoginForm />
              ) : (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Kurulum eksik</p>
                  <p className="mt-1">`DATABASE_URL` ve `OPS_SESSION_SECRET` tanimlanmali.</p>
                  <p className="mt-2">Ardindan `npm run ops:bootstrap-user` ile ilk kullaniciyi olusturun.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
