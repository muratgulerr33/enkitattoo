"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { storyItems, type StoryItem } from "@/lib/mock/feed";
import { cn } from "@/lib/utils";

function StoryCircle({ item }: { item: StoryItem }) {
  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 snap-center flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-accent/50",
        item.isNew && "ring-2 ring-ring/30 ring-offset-2 ring-offset-surface-2"
      )}
      aria-label={`${item.name} hikayesi`}
    >
      <Avatar className="size-14 shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {item.initials}
        </AvatarFallback>
      </Avatar>
      <span className="t-small max-w-[72px] truncate text-center text-foreground">
        {item.name}
      </span>
    </button>
  );
}

export function StoriesRow() {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:thin]">
        {storyItems.map((item) => (
          <StoryCircle key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
