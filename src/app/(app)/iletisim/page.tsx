import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  addressLine,
  callUrl,
  directionsUrl,
  hoursNote,
  instagramUrl,
  mapsEmbedUrl,
  phoneDisplay,
  studioName,
  whatsappUrl,
} from "@/lib/mock/enki";
import { MapPin, Phone } from "lucide-react";

export default function IletisimPage() {
  return (
    <div className="space-y-6 xl:grid xl:grid-cols-[1fr_360px] xl:gap-8 xl:items-start">
      <div className="space-y-6">
        <header>
          <h1 className="t-h2 text-foreground">İletişim</h1>
          <p className="t-muted mt-1">Bize ulaşın, randevu alın.</p>
        </header>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Hızlı Randevu
          </a>
        </Button>

        <Card className="border-border bg-surface-2">
          <CardHeader>
            <CardTitle className="t-h4">{studioName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 text-foreground">
              <a
                href={callUrl}
                className="t-body flex items-center gap-2 hover:text-muted-foreground"
              >
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                {phoneDisplay}
              </a>
              <div className="t-body flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>{addressLine}</span>
              </div>
              <p className="t-caption text-muted-foreground">{hoursNote}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="default" size="sm" className="shrink-0">
                <a href={whatsappUrl}>WhatsApp</a>
              </Button>
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <a href={instagramUrl}>Instagram</a>
              </Button>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <a href={directionsUrl}>Yol tarifi al</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border bg-surface-2 xl:sticky xl:top-[calc(env(safe-area-inset-top)+104px)]">
        <CardContent className="p-0">
          <iframe
            src={mapsEmbedUrl}
            title="ENKİ Tattoo Studio harita"
            className="h-64 w-full border-0 md:h-80 xl:h-[400px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </CardContent>
      </Card>
    </div>
  );
}
