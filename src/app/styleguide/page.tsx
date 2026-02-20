"use client";

import { FeedSkeleton } from "@/components/legacy/social-mock/feed-skeleton";
import { HomeComposer } from "@/components/legacy/social-mock/home-composer";
import { PostCard } from "@/components/legacy/social-mock/post-card";
import { StoriesRow } from "@/components/legacy/social-mock/stories-row";
import { TokenGrid } from "@/components/styleguide/token-grid";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { feedItems } from "@/lib/mock/feed";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const SURFACE_SAMPLES = [
  { label: "background", class: "bg-background" },
  { label: "surface-1", class: "bg-surface-1" },
  { label: "surface-2", class: "bg-surface-2" },
  { label: "card", class: "bg-card" },
  { label: "muted", class: "bg-muted" },
] as const;

const TYPE_RAMP = [
  { label: "Display", class: "t-display", sample: "Display" },
  { label: "H1", class: "t-h1", sample: "Heading 1" },
  { label: "H2", class: "t-h2", sample: "Heading 2" },
  { label: "H3", class: "t-h3", sample: "Heading 3" },
  { label: "H4", class: "t-h4", sample: "Heading 4" },
  { label: "H5", class: "t-h5", sample: "Heading 5" },
  { label: "H6", class: "t-h6", sample: "Heading 6" },
  { label: "Lead", class: "t-lead", sample: "Lead paragraph" },
  { label: "Body", class: "t-body", sample: "Body text" },
  { label: "Small", class: "t-small", sample: "Small text" },
  { label: "Caption", class: "t-caption", sample: "Caption" },
] as const;

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="t-display">Styleguide</h1>
            <p className="t-muted mt-1">Enki Tattoo • Neutral System</p>
          </div>
          <ThemeSwitch />
        </header>

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="foundations">Foundations</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="removed">Removed (examples)</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-10 pt-6">
            <section>
              <h2 className="t-h2 mb-4">Surface preview</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {SURFACE_SAMPLES.map(({ label, class: c }) => (
                  <div
                    key={label}
                    className={`rounded-lg border border-border p-4 ${c}`}
                  >
                    <span className="t-caption block">{label}</span>
                    <span className="t-small mt-1 block opacity-80">
                      Sample text
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <Separator />
            <section>
              <h2 className="t-h2 mb-4">Color Tokens</h2>
              <TokenGrid />
            </section>
            <section>
              <h2 className="t-h2 mb-4">Overlay (alpha)</h2>
              <div className="relative h-32 overflow-hidden rounded-lg bg-surface-2">
                <div className="absolute inset-0 bg-overlay" />
                <div className="relative flex h-full items-center justify-center">
                  <span className="t-body text-card">Content over overlay</span>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="typography" className="space-y-10 pt-6">
            <section>
              <h2 className="t-h2 mb-4">Type Ramp</h2>
              <div className="space-y-4">
                {TYPE_RAMP.map(({ label, class: c, sample }) => (
                  <div
                    key={label}
                    className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4 last:border-0"
                  >
                    <span className="t-muted shrink-0">{label}</span>
                    <span className={`flex-1 ${c}`}>{sample}</span>
                    <code className="t-code rounded bg-muted px-2 py-1 text-muted-foreground">
                      {c}
                    </code>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="t-h2 mb-2">Weights (same text)</h2>
              <p className="t-muted mb-3">font-normal, medium, semibold, bold</p>
              <div className="space-y-2">
                <p className="t-body font-normal">The quick brown fox.</p>
                <p className="t-body font-medium">The quick brown fox.</p>
                <p className="t-body font-semibold">The quick brown fox.</p>
                <p className="t-body font-bold">The quick brown fox.</p>
              </div>
            </section>
            <Separator />
            <section>
              <h2 className="t-h2 mb-4">Paragraph rhythm</h2>
              <div className="space-y-4">
                <p className="t-body">
                  This is body text with <strong>emphasis</strong> and a{" "}
                  <Button variant="link" asChild className="h-auto p-0">
                    <a href="#typography">link</a>
                  </Button>{" "}
                  inline. Use t-body for readable paragraphs and consistent
                  vertical rhythm.
                </p>
                <p className="t-body">
                  A second paragraph keeps the same line height and spacing so
                  blocks feel balanced.
                </p>
                <p className="t-muted">
                  Muted paragraph for secondary or helper content below.
                </p>
              </div>
            </section>
            <section>
              <h2 className="t-h2 mb-4">Inline elements</h2>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="link" asChild>
                  <a href="#inline">Link (Button variant=link)</a>
                </Button>
                <code className="t-code rounded bg-muted px-2 py-1">
                  t-code chip
                </code>
                <Badge variant="secondary">Badge inline</Badge>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="foundations" className="space-y-10 pt-6">
            <section>
              <h2 className="t-h2 mb-4">Spacing scale</h2>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-lg border border-border bg-muted p-2">
                  <span className="t-caption">p-2</span>
                </div>
                <div className="rounded-lg border border-border bg-muted p-3">
                  <span className="t-caption">p-3</span>
                </div>
                <div className="rounded-lg border border-border bg-muted p-4">
                  <span className="t-caption">p-4</span>
                </div>
                <div className="rounded-lg border border-border bg-muted p-6">
                  <span className="t-caption">p-6</span>
                </div>
              </div>
            </section>
            <section>
              <h2 className="t-h2 mb-4">Radius</h2>
              <div className="flex flex-wrap gap-4">
                <div className="h-16 w-24 rounded-md border border-border bg-muted" />
                <div className="h-16 w-24 rounded-lg border border-border bg-muted" />
                <div className="h-16 w-24 rounded-xl border border-border bg-muted" />
              </div>
              <p className="t-caption mt-2">
                --radius (base), rounded-md, rounded-lg, rounded-xl
              </p>
            </section>
            <section>
              <h2 className="t-h2 mb-4">Shadows</h2>
              <div className="flex flex-wrap gap-6">
                <div className="h-20 w-32 rounded-lg border border-border bg-card shadow-soft p-3">
                  <span className="t-caption">shadow-soft</span>
                </div>
                <div className="h-20 w-32 rounded-lg border border-border bg-popover shadow-popover p-3">
                  <span className="t-caption">shadow-popover</span>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="components" className="space-y-10 pt-6">
            <section>
              <h2 className="t-h2 mb-4">Buttons</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <p className="t-muted">Disabled:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" disabled>
                    Default
                  </Button>
                  <Button variant="secondary" disabled>
                    Secondary
                  </Button>
                  <Button variant="outline" disabled>
                    Outline
                  </Button>
                  <Button variant="ghost" disabled>
                    Ghost
                  </Button>
                  <Button variant="link" disabled>
                    Link
                  </Button>
                  <Button variant="destructive" disabled>
                    Destructive
                  </Button>
                </div>
                <p className="t-muted">Icon button:</p>
                <Button size="icon" variant="outline">
                  <Sparkles className="size-4" />
                </Button>
              </div>
            </section>

            <section>
              <h2 className="t-h2 mb-4">Inputs</h2>
              <div className="grid max-w-sm gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sg-input">Label + Input</Label>
                  <Input id="sg-input" placeholder="Placeholder" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-textarea">Label + Textarea</Label>
                  <Textarea id="sg-textarea" placeholder="Textarea placeholder" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-focus">Focus ring test</Label>
                  <Input id="sg-focus" placeholder="Focus to see ring" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-invalid">Invalid state (aria-invalid)</Label>
                  <Input
                    id="sg-invalid"
                    placeholder="Invalid example"
                    aria-invalid
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="t-h2 mb-4">Cards</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic card</CardTitle>
                    <CardDescription>Description for the card.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="t-muted">Muted paragraph inside card.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card with badges</CardTitle>
                    <CardDescription>Badge variants below.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card with actions</CardTitle>
                    <CardDescription>Footer with buttons.</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Save</Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="t-h2 mb-4">Toast / Sonner</h2>
              <Button
                variant="secondary"
                onClick={() => toast.success("Styleguide toast triggered.")}
              >
                Trigger toast
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="removed" className="space-y-10 pt-6">
            <p className="t-muted">
              These components were removed from the Home page (V1 Hub architecture). Shown here as examples only.
            </p>
            <section>
              <h2 className="t-h2 mb-4">StoriesRow</h2>
              <StoriesRow />
            </section>
            <section>
              <h2 className="t-h2 mb-4">HomeComposer</h2>
              <HomeComposer />
            </section>
            <section>
              <h2 className="t-h2 mb-4">PostCard / Feed</h2>
              <ul className="list-none space-y-6 p-0 m-0">
                {feedItems.slice(0, 2).map((item) => (
                  <li key={item.id}>
                    <PostCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="t-h2 mb-4">FeedSkeleton</h2>
              <FeedSkeleton />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
