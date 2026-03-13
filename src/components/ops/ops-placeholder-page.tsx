import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OpsPlaceholderPageProps = {
  title: string;
  description: string;
  nextStep: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function OpsPlaceholderPage({
  title,
  description,
  nextStep,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: OpsPlaceholderPageProps) {
  return (
    <div className="ops-page-shell">
      <Card className="border-border bg-card">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="text-sm font-medium text-foreground">Sonraki adım</p>
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
