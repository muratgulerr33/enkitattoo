import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OpsPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function OpsPlaceholderPage({
  eyebrow,
  title,
  description,
  nextStep,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: OpsPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
          {eyebrow}
        </Badge>
        <div className="space-y-2">
          <h1 className="typo-page-title">{title}</h1>
          <p className="typo-p max-w-2xl text-muted-foreground">{description}</p>
        </div>
      </header>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Bu alan foundation asamasinda</CardTitle>
          <CardDescription>
            Gercek domain davranisi bu PR kapsaminda degil. Bu yuzey route, shell ve
            izolasyon omurgasini dogrulamak icin acildi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="text-sm font-medium text-foreground">Sonraki adim</p>
            <p className="mt-1 text-sm text-muted-foreground">{nextStep}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="cta" className="w-full sm:w-auto">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant="outline" size="cta" className="w-full sm:w-auto">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
