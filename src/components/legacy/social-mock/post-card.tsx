"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedItem } from "@/lib/mock/feed";
import { cn } from "@/lib/utils";
import { Heart, MessageSquare, Share2 } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PostCard({ item }: { item: FeedItem }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-surface-2 p-4 shadow-sm",
        "space-y-3"
      )}
    >
      <header className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {getInitials(item.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="t-small font-medium truncate text-foreground">{item.authorName}</p>
          <p className="t-caption text-muted-foreground">
            {item.authorRole} · {item.createdAt}
          </p>
        </div>
      </header>

      <p className="t-body text-foreground">{item.text}</p>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs border-border bg-muted text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {item.hasMedia && (
        <Skeleton className="aspect-video w-full rounded-lg" />
      )}

      <div className="flex items-center gap-2 border-t border-border pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Heart className="size-4" aria-hidden />
          <span className="t-small">{item.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <MessageSquare className="size-4" aria-hidden />
          <span className="t-small">{item.comments}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Paylaş"
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
