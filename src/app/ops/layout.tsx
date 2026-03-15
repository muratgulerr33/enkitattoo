import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Enki Studio Operations",
    template: "%s | Enki Studio Operations",
  },
  description: "TR-only operations panel foundation for Enki Studio.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function OpsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-viewport bg-background text-foreground">{children}</div>;
}
