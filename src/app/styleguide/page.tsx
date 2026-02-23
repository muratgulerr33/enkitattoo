"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/mode-toggle";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PALETTE_PREVIEW = [
  { token: "background", swatchClass: "bg-background", sampleClass: "text-foreground" },
  { token: "foreground", swatchClass: "bg-foreground", sampleClass: "text-background" },
  { token: "muted", swatchClass: "bg-muted", sampleClass: "text-muted-foreground" },
  { token: "border", swatchClass: "border border-border bg-background", sampleClass: "text-foreground" },
  { token: "ring", swatchClass: "ring-2 ring-ring bg-background", sampleClass: "text-foreground" },
] as const;

const SPACING_SCALE = [4, 8, 12, 16, 24, 32] as const;

const CONTAINER_WIDTHS = [
  { label: "Compact", value: "max-w-3xl" },
  { label: "Content", value: "max-w-5xl" },
  { label: "Docs / DS", value: "max-w-6xl" },
] as const;

function ThemeValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
      <p className="typo-muted">{label}</p>
      <p className="typo-small mt-1">{value}</p>
    </div>
  );
}

export default function StyleguidePage() {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentMode = useMemo(() => {
    if (!mounted) {
      return "Loading...";
    }

    if (theme === "system") {
      return `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`;
    }

    return theme === "dark" ? "Dark" : "Light";
  }, [mounted, theme, resolvedTheme]);

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container app-section no-overflow-x space-y-12 md:space-y-14">
        <header className="space-y-8 border-b border-border/60 pb-10">
          <div className="flex justify-end">
            <ModeToggle variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" />
          </div>
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h1 className="typo-page-title typo-hero-title">Design System Style Guide</h1>
            <p className="mx-auto max-w-3xl text-lg leading-7 text-muted-foreground">
              shadcn/ui v4 odakli token, tipografi, component yogunlugu ve tema davranisi referansi.
            </p>
          </div>
        </header>

        <section id="foundations" className="space-y-8">
          <h2 className="typo-h2">Foundations</h2>
          <div className="grid-cards">
            {PALETTE_PREVIEW.map((item) => (
              <Card key={item.token} className="overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{item.token}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`rounded-md p-4 ${item.swatchClass}`}>
                    <span className={`text-sm ${item.sampleClass}`}>Sample</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Yeni sayfalar icin `typo-*` utility seti.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="typo-h1 border-none pb-0 text-foreground">Heading H1</p>
              <h2 className="typo-h2 mt-0">Heading H2</h2>
              <h3 className="typo-h3">Heading H3</h3>
              <h4 className="typo-h4">Heading H4</h4>
              <p className="typo-lead">Lead metin, section girisleri icin kullanilir.</p>
              <p className="typo-p">
                Bu bir paragraf ornegidir. Link davranisi icin{" "}
                <a href="#theme" className="typo-link">
                  typo-link
                </a>{" "}
                utility kullanilir, inline code icin <code className="typo-code">typo-code</code> tercih edilir.
              </p>
              <blockquote className="typo-blockquote">
                Tutarli tipografi ritmi, component yogunlugu ve okunabilirligi ayni anda artirir.
              </blockquote>
              <ul className="typo-list">
                <li>Basliklar: tracking-tight, net hiyerarsi</li>
                <li>Paragraf: 7-line-height ritmi</li>
                <li>Ikincil metin: muted foreground</li>
              </ul>
              <table className="typo-table">
                <thead>
                  <tr>
                    <th>Element</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>H1</td>
                    <td><code className="typo-code">typo-h1</code></td>
                  </tr>
                  <tr>
                    <td>Paragraph</td>
                    <td><code className="typo-code">typo-p</code></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>4 / 8 / 12 / 16 / 24 / 32 ritmi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SPACING_SCALE.map((space) => (
                  <div key={space} className="flex items-center gap-3">
                    <div className="w-14 text-sm text-muted-foreground">{space}px</div>
                    <div className="h-3 rounded-sm bg-primary/70" style={{ width: `${space * 4}px` }} />
                  </div>
                ))}
                <div className="pt-2">
                  <p className="typo-muted">Container genislik onerileri</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {CONTAINER_WIDTHS.map((item) => (
                      <li key={item.value} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <span>{item.label}</span>
                        <code className="typo-code">{item.value}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Radius + Shadow</CardTitle>
                <CardDescription>Button/Input/Card seviyelerinde ortak dil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-sm border border-border bg-muted p-3 text-xs">rounded-sm</div>
                  <div className="rounded-md border border-border bg-muted p-3 text-xs">rounded-md</div>
                  <div className="rounded-lg border border-border bg-muted p-3 text-xs">rounded-lg</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-card p-4 shadow-soft text-sm">shadow-soft</div>
                  <div className="rounded-lg border border-border bg-popover p-4 shadow-popover text-sm">shadow-popover</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="components" className="space-y-8">
          <h2 className="typo-h2">Components</h2>
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Variant ve size kombinasyonlari.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs" variant="outline">XS</Button>
                <Button size="sm" variant="outline">SM</Button>
                <Button size="default" variant="outline">Default</Button>
                <Button size="lg" variant="outline">LG</Button>
                <Button size="icon" variant="outline" aria-label="Icon">*</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Hover/focus/disabled/error davranislari.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sg-default-input">Default</Label>
                  <Input id="sg-default-input" placeholder="Type here" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-focus-input">Focus ring test</Label>
                  <Input id="sg-focus-input" placeholder="Focus me" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-disabled-input">Disabled</Label>
                  <Input id="sg-disabled-input" placeholder="Disabled" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-error-input">Error</Label>
                  <Input id="sg-error-input" placeholder="aria-invalid=true" aria-invalid />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-textarea">Textarea</Label>
                  <Textarea id="sg-textarea" placeholder="Long form input" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards, Badges, Tabs</CardTitle>
                <CardDescription>Icerik bloklari ve durum etiketleri.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <Tabs defaultValue="tokens" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tokens" className="mt-3 rounded-md border border-border p-3 text-sm">
                    Semantic tokenlar dokumantasyona baglidir.
                  </TabsContent>
                  <TabsContent value="content" className="mt-3 rounded-md border border-border p-3 text-sm">
                    Component yogunlugu compact tutulur.
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>shadcn table primitive.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>background</TableCell>
                      <TableCell>Page canvas</TableCell>
                      <TableCell className="text-right">Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>muted</TableCell>
                      <TableCell>Secondary blocks</TableCell>
                      <TableCell className="text-right">Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ring</TableCell>
                      <TableCell>Focus visibility</TableCell>
                      <TableCell className="text-right">Required</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dialog + Toast</CardTitle>
                <CardDescription>Overlay ve feedback componentleri.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog title</DialogTitle>
                      <DialogDescription>
                        Focus trap ve close behavior Radix altyapisiyla calisir.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="secondary"
                  onClick={() => toast.success("Toast demo tetiklendi.")}
                >
                  Trigger toast
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="accessibility" className="space-y-8">
          <h2 className="typo-h2">Accessibility</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Focus Ring Visibility</CardTitle>
                <CardDescription>Her iki temada ring belirgin olmalidir.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline">Tab ile focus test</Button>
                <Input placeholder="Input focus test" />
                <p className="typo-muted">focus-visible ring token: <code className="typo-code">ring-ring/50</code></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contrast + Motion</CardTitle>
                <CardDescription>Muted metin ve reduced motion notu.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground">
                  Primary content: yuksek kontrastli foreground kullanilir.
                </p>
                <p className="text-sm text-muted-foreground">
                  Secondary content: muted-foreground ile okunabilirlik korunur.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Animasyonlar kisa ve islevsel tutulur.</li>
                  <li><code className="typo-code">prefers-reduced-motion</code> aktifse gereksiz hareketten kacinin.</li>
                  <li>Fokus, sadece renk degil ring ile de belirtilir.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="theme" className="space-y-8">
          <h2 className="typo-h2">Theme</h2>
          <Card>
            <CardHeader>
              <CardTitle>Theme State</CardTitle>
              <CardDescription>System + override davranisi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ThemeValue label="theme" value={mounted ? String(theme) : "loading"} />
                <ThemeValue label="resolvedTheme" value={mounted ? String(resolvedTheme) : "loading"} />
                <ThemeValue label="systemTheme" value={mounted ? String(systemTheme) : "loading"} />
                <ThemeValue label="active mode" value={currentMode} />
              </div>
              <div className="flex items-center gap-3">
                <ModeToggle withLabel size="sm" />
                <p className="typo-muted">Secim localStorage uzerinde kalici olarak saklanir.</p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Varsayilan davranis: <code className="typo-code">system</code>.</li>
                <li>Kullanici Light veya Dark secerek OS temasini override edebilir.</li>
                <li>Override secimi yenileme sonrasinda da korunur.</li>
                <li>Tekrar System secilirse uygulama OS temasi ile senkron calisir.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
