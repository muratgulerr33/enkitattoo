"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PencilLine } from "lucide-react";
import {
  createArtistAction,
  updateArtistAction,
  updateArtistStatusAction,
} from "@/app/ops/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ArtistListItem,
  ArtistManagementFilter,
} from "@/lib/ops/artists";
import type { OpsSettingsActionState } from "@/lib/ops/settings";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OpsSettingsActionState = {
  error: null,
  success: null,
};

type OpsArtistManagementProps = {
  filter: ArtistManagementFilter;
  counts: {
    active: number;
    inactive: number;
    total: number;
  };
  artists: ArtistListItem[];
};

function ArtistStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
        isActive
          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-200"
          : "bg-amber-500/10 text-amber-700 dark:bg-amber-400/12 dark:text-amber-200"
      )}
    >
      {isActive ? "Aktif" : "Pasif"}
    </span>
  );
}

function ArtistStatusAction({
  artist,
}: {
  artist: ArtistListItem;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateArtistStatusAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="artistUserId" value={artist.userId} />
      <input
        type="hidden"
        name="nextStatus"
        value={artist.isActive ? "inactive" : "active"}
      />

      {state.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Güncelleniyor
          </>
        ) : artist.isActive ? (
          "Pasife al"
        ) : (
          "Aktifleştir"
        )}
      </Button>
    </form>
  );
}

function ArtistEditDialog({ artist }: { artist: ArtistListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateArtistAction, INITIAL_STATE);
  const dialogOpen = open && !state.success;

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="rounded-lg">
          <PencilLine className="size-4" aria-hidden />
          Düzenle
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl border p-0 dark:border-border/90 dark:bg-card/96">
        <div className="space-y-5 p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Artist düzenle</DialogTitle>
            <DialogDescription>Ad soyad ve telefon bilgisini güncelleyin.</DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="artistUserId" value={artist.userId} />

            <div className="space-y-2">
              <Label htmlFor={`artist-full-name-${artist.userId}`}>Ad soyad</Label>
              <Input
                id={`artist-full-name-${artist.userId}`}
                name="fullName"
                defaultValue={artist.fullName ?? ""}
                className="dark:border-border/90 dark:bg-surface-1/78"
                disabled={pending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`artist-phone-${artist.userId}`}>Telefon</Label>
              <Input
                id={`artist-phone-${artist.userId}`}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                defaultValue={artist.phone ?? ""}
                className="dark:border-border/90 dark:bg-surface-1/78"
                disabled={pending}
                required
              />
            </div>

            {state.error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            {state.success ? (
              <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-surface-1/72">
                {state.success}
              </p>
            ) : null}

            <Button type="submit" size="cta" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Kaydediliyor
                </>
              ) : (
                "Değişiklikleri kaydet"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OpsArtistManagement({
  filter,
  counts,
  artists,
}: OpsArtistManagementProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createArtistAction, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/92">
            Yeni artist varsayılan olarak aktif açılır. Daha sonra bu listeden pasife alabilir
            veya yeniden aktifleştirebilirsiniz.
          </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl border border-border bg-surface-1/45 p-4 dark:border-border/90 dark:bg-surface-1/62">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="artistCreateFullName">Ad soyad</Label>
            <Input
              id="artistCreateFullName"
              name="fullName"
              autoComplete="name"
              placeholder="Ad soyad"
              className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
              disabled={pending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistCreatePhone">Telefon</Label>
            <Input
              id="artistCreatePhone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="05xx xxx xx xx"
              className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
              disabled={pending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistCreatePassword">Başlangıç şifresi</Label>
            <Input
              id="artistCreatePassword"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="En az 8 karakter"
              className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
              disabled={pending}
              required
            />
          </div>
        </div>

        {state.error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-card/92">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Oluşturuluyor
            </>
          ) : (
            "Artist oluştur"
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/ops/staff/profil"
          aria-current={filter === "active" ? "page" : undefined}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium",
            filter === "active"
              ? "border-border bg-foreground text-background dark:border-border/95 dark:bg-foreground dark:text-background"
              : "border-border bg-background text-foreground hover:bg-muted/45 dark:border-border/90 dark:bg-surface-1/72 dark:hover:bg-surface-1/88"
          )}
        >
          Aktif ({counts.active})
        </Link>
        <Link
          href="/ops/staff/profil?artistStatus=inactive"
          aria-current={filter === "inactive" ? "page" : undefined}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium",
            filter === "inactive"
              ? "border-border bg-foreground text-background dark:border-border/95 dark:bg-foreground dark:text-background"
              : "border-border bg-background text-foreground hover:bg-muted/45 dark:border-border/90 dark:bg-surface-1/72 dark:hover:bg-surface-1/88"
          )}
        >
          Pasif ({counts.inactive})
        </Link>
        <Link
          href="/ops/staff/profil?artistStatus=all"
          aria-current={filter === "all" ? "page" : undefined}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium",
            filter === "all"
              ? "border-border bg-foreground text-background dark:border-border/95 dark:bg-foreground dark:text-background"
              : "border-border bg-background text-foreground hover:bg-muted/45 dark:border-border/90 dark:bg-surface-1/72 dark:hover:bg-surface-1/88"
          )}
        >
          Tümü ({counts.total})
        </Link>
      </div>

      <div className="space-y-3">
        {artists.length ? (
          artists.map((artist) => (
            <div
              key={artist.userId}
              className="rounded-2xl border border-border bg-background px-4 py-4 dark:border-border/90 dark:bg-card/94"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {artist.fullName ?? artist.displayName ?? `Artist #${artist.userId}`}
                    </p>
                    <ArtistStatusBadge isActive={artist.isActive} />
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
                    <p>{artist.phone ?? "Telefon belirtilmemiş"}</p>
                    {artist.email ? <p>{artist.email}</p> : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ArtistEditDialog artist={artist} />
                  <ArtistStatusAction artist={artist} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground dark:border-border/80 dark:bg-surface-1/46 dark:text-muted-foreground/92">
            Bu filtrede artist yok.
          </div>
        )}
      </div>
    </div>
  );
}
