"use client";

import { IconMessageCircle } from "@/components/icons/nandd";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ChatBubble() {
  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-40 xl:bottom-8 xl:right-6">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-popover"
        aria-label="Canlı sohbet"
        onClick={() => toast.info("Yakında: canlı sohbet")}
      >
        <IconMessageCircle size={24} />
      </Button>
    </div>
  );
}
