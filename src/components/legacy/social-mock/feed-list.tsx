"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedItem } from "@/lib/mock/feed";
import { Heart, MessageCircle, Share2 } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="size-10">
          <AvatarFallback className="text-sm text-muted-foreground">
            {getInitials(item.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="t-small font-medium text-foreground truncate">
            {item.authorName}
          </p>
          <p className="t-caption text-muted-foreground">
            {item.authorRole} · {item.createdAt}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="t-body">{item.text}</p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {item.hasMedia && (
          <Skeleton className="aspect-video w-full rounded-lg border-border" />
        )}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Heart className="size-4" aria-hidden />
            <span className="t-small">{item.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <MessageCircle className="size-4" aria-hidden />
            <span className="t-small">{item.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" aria-label="Paylaş">
            <Share2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <ul className="space-y-6 list-none p-0 m-0">
      {items.map((item) => (
        <li key={item.id}>
          <FeedCard item={item} />
        </li>
      ))}
    </ul>
  );
}
