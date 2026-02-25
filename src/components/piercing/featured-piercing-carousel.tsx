"use client";

import { FEATURED_PIERCING } from "@/lib/piercing/featured-piercing";
import { FeaturedPiercingCard } from "@/components/piercing/featured-piercing-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedPiercingCarousel() {
  return (
    <section aria-labelledby="featured-piercing-heading" className="space-y-3">
      <div>
        <h2 id="featured-piercing-heading" className="t-h4 text-foreground">
          Öne Çıkan Kombinler
        </h2>
        <p className="t-caption mt-1 text-muted-foreground">Kaydır, tarzını seç.</p>
      </div>

      <Carousel opts={{ align: "start", loop: false }} className="w-full px-4">
        <CarouselContent className="-ml-4">
          {FEATURED_PIERCING.map((item) => (
            <CarouselItem key={item.id} className="basis-[92%] pl-4 md:basis-1/2 lg:basis-1/3">
              <FeaturedPiercingCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-1 hidden md:inline-flex" />
        <CarouselNext className="-right-1 hidden md:inline-flex" />
      </Carousel>
    </section>
  );
}
