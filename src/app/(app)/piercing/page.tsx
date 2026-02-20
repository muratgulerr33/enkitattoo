import { piercingCategories } from "@/lib/hub/hubs.v1";
import { whatsappUrl } from "@/lib/mock/enki";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const PIERCING_LABELS: Record<string, string> = {
  kulak: "Kulak",
  burun: "Burun",
  kas: "Kaş",
  dudak: "Dudak",
  dil: "Dil",
  gobek: "Göbek",
  septum: "Septum",
  industrial: "Industrial",
  diger: "Diğer",
};

export default function PiercingPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="t-h2 text-foreground">Piercing</h1>
        <p className="t-muted mt-1">
          Kulak, burun, septum ve daha fazlası. Profesyonel piercing hizmeti
          için bize yazın.
        </p>
      </header>

      <section>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Piercing için yaz
          </a>
        </Button>
      </section>

      <section aria-labelledby="piercing-categories">
        <h2 id="piercing-categories" className="t-h4 text-foreground mb-3">
          Kategoriler
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {piercingCategories.map((key) => (
            <div
              key={key}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface-2 p-4 shadow-soft transition-colors hover:bg-accent/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <span className="t-body text-foreground">
                {PIERCING_LABELS[key] ?? key}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="piercing-faq">
        <h2 id="piercing-faq" className="t-h4 text-foreground mb-3">
          Sık sorulanlar
        </h2>
        <dl className="space-y-4 rounded-xl border border-border bg-surface-2 p-4 shadow-soft">
          <div>
            <dt className="t-body font-medium text-foreground">
              Piercing sonrası bakım nasıl olmalı?
            </dt>
            <dd className="t-muted mt-1">
              Öneriler randevu sonrası size iletilecektir.
            </dd>
          </div>
          <div>
            <dt className="t-body font-medium text-foreground">
              Hangi bölgelere piercing yapıyorsunuz?
            </dt>
            <dd className="t-muted mt-1">
              Kulak, burun, septum, kaş, dil ve daha fazlası.
            </dd>
          </div>
          <div>
            <dt className="t-body font-medium text-foreground">
              Randevu nasıl alınır?
            </dt>
            <dd className="t-muted mt-1">
              WhatsApp üzerinden bize yazarak randevu alabilirsiniz.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
