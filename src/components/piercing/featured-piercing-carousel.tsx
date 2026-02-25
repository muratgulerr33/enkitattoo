"use client";

import { FEATURED_PIERCING } from "@/lib/piercing/featured-piercing";
import { FeaturedPiercingCard } from "@/components/piercing/featured-piercing-card";

export function FeaturedPiercingCarousel() {
  return (
    <section aria-labelledby="featured-piercing-heading" className="space-y-3">
      <div>
        <h2 id="featured-piercing-heading" className="t-h4 text-foreground">
          Öne Çıkan Piercingler
        </h2>
        <p className="t-caption mt-1 text-muted-foreground">Kaydır, tarzını seç.</p>
      </div>

      <div
        className="w-full overflow-x-auto px-4 snap-x snap-mandatory scroll-pr-16 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        aria-label="Öne çıkan piercing kartları"
      >
        <ul className="flex min-w-0 gap-4">
          {FEATURED_PIERCING.map((item) => (
            <li
              key={item.id}
              className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[46%] lg:basis-[31%]"
            >
              <FeaturedPiercingCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
