import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPiercingIcon } from "@/lib/piercing/piercing-icons";
import { getPiercingLabelKey } from "@/lib/piercing/piercing-labels";
import { cn } from "@/lib/utils";

interface PiercingCategoryGridProps {
  paths: string[];
  currentPath?: string;
  title?: string;
  className?: string;
}

function normalizePath(pathValue: string): string {
  return pathValue.replace(/\/+$/, "");
}

export async function PiercingCategoryGrid({
  paths,
  currentPath,
  title,
  className,
}: PiercingCategoryGridProps) {
  const t = await getTranslations();
  const normalizedCurrentPath = currentPath ? normalizePath(currentPath) : "";
  const headingId = normalizedCurrentPath ? "piercing-categories-related" : "piercing-categories";
  const resolvedTitle = title ?? t("pages.piercing.categoriesTitle");

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="t-h4 text-foreground mb-3">
        {resolvedTitle}
      </h2>
      <div className="grid-cards">
        {paths.map((pathValue) => {
          const label = t(getPiercingLabelKey(pathValue));
          const Icon = getPiercingIcon(pathValue);
          const isCustom =
            pathValue === "/piercing/kisiye-ozel" || pathValue.endsWith("/kisiye-ozel");
          const isActive = normalizePath(pathValue) === normalizedCurrentPath;

          return (
            <Link
              key={pathValue}
              href={pathValue}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50",
                isCustom && "col-span-2",
                isActive && "border-ring/50 bg-accent/35 ring-2 ring-ring/40"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="t-body text-foreground">{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
