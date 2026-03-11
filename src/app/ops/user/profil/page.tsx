import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDashed, FileText, ShieldCheck } from "lucide-react";
import { OpsProfileForm } from "@/components/ops/ops-profile-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { getUserWorkspaceOverview } from "@/lib/ops/user-workspace";

function StatusBadge({ complete }: { complete: boolean }) {
  return complete ? (
    <Badge className="rounded-full">Hazır</Badge>
  ) : (
    <Badge variant="outline" className="rounded-full">
      Eksik
    </Badge>
  );
}

function SummaryRow({
  icon,
  title,
  description,
  complete,
  href,
  linkLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  complete: boolean;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
      <div className="mt-0.5 shrink-0 text-foreground">{icon}</div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <StatusBadge complete={complete} />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href={href} className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}

export default async function OpsUserProfilePage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="typo-page-title">Profil</h1>
        <p className="typo-p text-muted-foreground">
          Bilgilerinizi kısa tutun. Form ve onay durumunu da buradan görün.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Durum özeti</CardTitle>
          <CardDescription>Sıradaki adımı tek ekranda görün.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SummaryRow
            icon={
              overview.isProfileComplete ? (
                <CheckCircle2 className="size-5" aria-hidden />
              ) : (
                <CircleDashed className="size-5" aria-hidden />
              )
            }
            title="Profil bilgileri"
            description={
              overview.isProfileComplete
                ? "Temel bilgiler kayıtlı."
                : "Ad soyad ve telefon eksikse önce bu bölümü tamamlayın."
            }
            complete={overview.isProfileComplete}
            href="/ops/user/profil"
            linkLabel="Profili düzenle"
          />
          <SummaryRow
            icon={<FileText className="size-5" aria-hidden />}
            title="Tattoo formu"
            description={
              overview.isTattooFormSubmitted
                ? "Form tamamlandı. İsterseniz yeni bir kayıt oluşturarak güncelleyebilirsiniz."
                : "Dövme formu henüz tamamlanmadı."
            }
            complete={overview.isTattooFormSubmitted}
            href="/ops/user/form"
            linkLabel="Forma git"
          />
          <SummaryRow
            icon={<ShieldCheck className="size-5" aria-hidden />}
            title="Açık onay"
            description={
              overview.hasCurrentConsent
                ? "Güncel sürüm için onay kaydı var."
                : "Form tamamlandıktan sonra onay kutusunu işaretleyin."
            }
            complete={overview.hasCurrentConsent}
            href="/ops/user/form#onay"
            linkLabel="Onayı gör"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil bilgileri</CardTitle>
          <CardDescription>E-posta sabit kalır. Ad soyad ve telefon aktif kullanılır.</CardDescription>
        </CardHeader>
        <CardContent>
          <OpsProfileForm
            email={overview.profile.email}
            fullName={overview.profile.fullName}
            displayName={overview.profile.displayName}
            phone={overview.profile.phone}
          />
        </CardContent>
      </Card>
    </div>
  );
}
