import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/bottom-nav";
import { ChatBubble } from "@/components/app/chat-bubble";
import { MobileHeader } from "@/components/app/mobile-header";
import { RightRail } from "@/components/app/right-rail";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MobileHeader />
      <AppHeader className="hidden md:block" />
      <main
        className="w-full max-w-none px-4 pb-[max(4.5rem,1.5rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+104px)] md:px-6 md:pt-14 xl:mx-auto xl:max-w-6xl xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8 xl:px-6"
      >
        <div className="xl:min-w-0 xl:max-w-[860px]">
          {children}
        </div>
        <div className="hidden xl:block">
          <RightRail />
        </div>
      </main>
      <BottomNav />
      <ChatBubble />
    </>
  );
}
