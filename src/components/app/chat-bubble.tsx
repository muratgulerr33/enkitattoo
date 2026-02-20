"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

export function ChatBubble() {
  return (
    <div className="fixed bottom-6 right-4 z-40 md:bottom-8 md:right-6">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-popover"
        aria-label="Canlı sohbet"
        onClick={() => toast.info("Yakında: canlı sohbet")}
      >
        <MessageCircle className="size-6" />
      </Button>
    </div>
  );
}
