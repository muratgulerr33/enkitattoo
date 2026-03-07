"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GalleryVisibleItem } from "@/lib/gallery/manifest.v1";

interface GalleryGridProps {
  items: GalleryVisibleItem[];
}

function withSearchParams(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const INITIAL_COUNT = 12;
const PAGE_SIZE = 12;

export function GalleryGrid({ items }: GalleryGridProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const viewerItems = React.useMemo(() => items, [items]);
  const itemIndexById = React.useMemo(
    () => new Map(viewerItems.map((item, index) => [item.id, index])),
    [viewerItems],
  );
  const cardPerfStyle = React.useMemo<React.CSSProperties>(
    () => ({ contentVisibility: "auto", containIntrinsicSize: "320px 426px" }),
    [],
  );

  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [showLoader, setShowLoader] = React.useState(false);
  const [slowHint, setSlowHint] = React.useState(false);
  const [disableDragOnDesktop, setDisableDragOnDesktop] = React.useState(false);
  const [perfOn, setPerfOn] = React.useState(false);
  const [debugCarousel, setDebugCarousel] = React.useState(false);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [mountedIndexes, setMountedIndexes] = React.useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_COUNT);
  const [hubQueryKey, setHubQueryKey] = React.useState("");
  const [readyIds, setReadyIds] = React.useState<Set<string>>(new Set());
  const openedWithPushRef = React.useRef(false);
  const openPerfPendingRef = React.useRef(false);
  const wasViewerOpenRef = React.useRef(false);
  const lastScrollYRef = React.useRef(0);
  const wasOpenForScrollRef = React.useRef(false);
  const loadMoreSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const preloadedSrcRef = React.useRef<Set<string>>(new Set());

  const activeId = React.useMemo(() => {
    if (openId) return openId;
    return viewerItems[selectedIndex]?.id ?? null;
  }, [openId, selectedIndex, viewerItems]);

  const isActiveReady = React.useMemo(() => {
    if (!activeId) return true;
    return readyIds.has(activeId);
  }, [activeId, readyIds]);
  const shouldWatchDrag = React.useCallback(
    (_api: unknown, evt: MouseEvent | TouchEvent) => {
      if (!disableDragOnDesktop) return true;
      return !(evt instanceof MouseEvent);
    },
    [disableDragOnDesktop],
  );
  const viewerOpts = React.useMemo(
    () => ({
      loop: false,
      dragFree: false,
      skipSnaps: false,
      watchDrag: shouldWatchDrag,
    }),
    [shouldWatchDrag],
  );
  const [emblaViewportRef, emblaApi] = useEmblaCarousel(viewerOpts);

  const readItemFromLocation = React.useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("item");
  }, []);

  const readPerfFromLocation = React.useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("perf") === "1";
  }, []);

  const readDebugFromLocation = React.useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("debugCarousel") === "1";
  }, []);
  const readHubFromLocation = React.useCallback((): string => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("hub") ?? "";
  }, []);

  const setItemParam = React.useCallback(
    (itemId: string | null, mode: "push" | "replace") => {
      if (typeof window === "undefined") return;
      const next = new URLSearchParams(window.location.search);
      if (itemId) next.set("item", itemId);
      else next.delete("item");
      const method = mode === "push" ? window.history.pushState : window.history.replaceState;
      method.call(window.history, window.history.state, "", withSearchParams(pathname, next));
    },
    [pathname],
  );

  const markViewerOpen = React.useCallback(() => {
    if (typeof window === "undefined" || !perfOn) return;
    window.performance.mark("g_open");
    openPerfPendingRef.current = true;
  }, [perfOn]);

  const measureViewerReady = React.useCallback(() => {
    if (typeof window === "undefined" || !perfOn || !openPerfPendingRef.current) return;
    window.performance.mark("g_ready");
    window.performance.measure("g_open_to_ready", "g_open", "g_ready");
    const entries = window.performance.getEntriesByName("g_open_to_ready");
    const last = entries.at(-1);
    if (last) {
      console.info(`[galeri-perf] OPEN->READY ms: ${last.duration.toFixed(1)}`);
    }
    openPerfPendingRef.current = false;
    window.performance.clearMarks("g_open");
    window.performance.clearMarks("g_ready");
    window.performance.clearMeasures("g_open_to_ready");
  }, [perfOn]);

  const preloadImage = React.useCallback(async (src: string) => {
    if (typeof window === "undefined" || !src || preloadedSrcRef.current.has(src)) return;
    preloadedSrcRef.current.add(src);
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
    try {
      if (typeof img.decode === "function") await img.decode();
    } catch {
      // Ignore decode errors; src stays cached for a best-effort warmup.
    }
  }, []);

  const markReady = React.useCallback((id: string) => {
    if (!id) return;
    setReadyIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);
  const addMountedIndexes = React.useCallback(
    (indexes: number[]) => {
      setMountedIndexes((current) => {
        const next = new Set(current);
        let changed = false;
        indexes.forEach((index) => {
          if (index < 0 || index >= viewerItems.length || next.has(index)) return;
          next.add(index);
          changed = true;
        });
        return changed ? next : current;
      });
    },
    [viewerItems.length],
  );

  React.useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [viewerItems]);

  React.useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [hubQueryKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    setDisableDragOnDesktop(hasFinePointer && canHover);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const nav = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        addEventListener?: (event: "change", listener: () => void) => void;
        removeEventListener?: (event: "change", listener: () => void) => void;
      };
    };
    const connection = nav.connection;

    const updateSlowHint = () => {
      const effectiveType = connection?.effectiveType ?? "";
      const isSlowType = effectiveType === "2g" || effectiveType === "slow-2g";
      setSlowHint(Boolean(connection?.saveData || isSlowType));
    };

    updateSlowHint();
    connection?.addEventListener?.("change", updateSlowHint);
    return () => connection?.removeEventListener?.("change", updateSlowHint);
  }, []);

  React.useEffect(() => {
    setPerfOn(readPerfFromLocation());
    setDebugCarousel(readDebugFromLocation());
    setHubQueryKey(readHubFromLocation());
    if (viewerItems.length === 0) {
      setOpen(false);
      setSelectedIndex(0);
      setOpenId(null);
      setShowLoader(false);
      const itemFromUrl = readItemFromLocation();
      if (itemFromUrl) setItemParam(null, "replace");
      openedWithPushRef.current = false;
      openPerfPendingRef.current = false;
      return;
    }

    const itemFromUrl = readItemFromLocation();
    if (!itemFromUrl) {
      setOpen(false);
      setOpenId(null);
      setShowLoader(false);
      openedWithPushRef.current = false;
      openPerfPendingRef.current = false;
      return;
    }

    const matchedIndex = itemIndexById.get(itemFromUrl);
    if (matchedIndex === undefined) {
      setOpen(false);
      setOpenId(null);
      setShowLoader(false);
      setItemParam(null, "replace");
      openedWithPushRef.current = false;
      openPerfPendingRef.current = false;
      return;
    }

    setSelectedIndex(matchedIndex);
    setOpenId(itemFromUrl);
    setShowLoader(false);
    setOpen(true);
    markViewerOpen();
    openedWithPushRef.current = false;
  }, [
    itemIndexById,
    markViewerOpen,
    readDebugFromLocation,
    readHubFromLocation,
    readItemFromLocation,
    readPerfFromLocation,
    setItemParam,
    viewerItems,
  ]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = () => {
      setPerfOn(readPerfFromLocation());
      setDebugCarousel(readDebugFromLocation());
      setHubQueryKey(readHubFromLocation());
      if (viewerItems.length === 0) {
        setOpen(false);
        setOpenId(null);
        setSelectedIndex(0);
        setShowLoader(false);
        openedWithPushRef.current = false;
        openPerfPendingRef.current = false;
        return;
      }

      const itemFromUrl = readItemFromLocation();
      if (!itemFromUrl) {
        setOpen(false);
        setOpenId(null);
        setShowLoader(false);
        openedWithPushRef.current = false;
        openPerfPendingRef.current = false;
        return;
      }

      const index = itemIndexById.get(itemFromUrl);
      if (index === undefined) {
        setOpen(false);
        setOpenId(null);
        setShowLoader(false);
        setItemParam(null, "replace");
        openedWithPushRef.current = false;
        openPerfPendingRef.current = false;
        return;
      }

      setSelectedIndex(index);
      setOpenId(itemFromUrl);
      setShowLoader(false);
      setOpen(true);
      markViewerOpen();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [
    itemIndexById,
    markViewerOpen,
    readDebugFromLocation,
    readHubFromLocation,
    readItemFromLocation,
    readPerfFromLocation,
    setItemParam,
    viewerItems.length,
  ]);

  React.useEffect(() => {
    if (!emblaApi) return;
    if (open && !wasViewerOpenRef.current) {
      emblaApi.scrollTo(selectedIndex, true);
      addMountedIndexes([selectedIndex - 1, selectedIndex, selectedIndex + 1]);
    }
    wasViewerOpenRef.current = open;
  }, [addMountedIndexes, emblaApi, open, selectedIndex]);

  React.useEffect(() => {
    if (!emblaApi || !open) return;

    const syncControls = (api: EmblaCarouselType) => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    const onSelect = (api: EmblaCarouselType) => {
      const snapIndex = api.selectedScrollSnap();
      const item = viewerItems[snapIndex];
      if (!item) return;
      setSelectedIndex(snapIndex);
      setOpenId(item.id);
      setShowLoader(false);
      addMountedIndexes([snapIndex - 1, snapIndex, snapIndex + 1]);
      syncControls(api);
    };
    const onSlidesInView = (api: EmblaCarouselType) => {
      const inView = api.slidesInView();
      const snapIndex = api.selectedScrollSnap();
      addMountedIndexes([...inView, snapIndex - 1, snapIndex, snapIndex + 1]);
    };
    const onSettle = (api: EmblaCarouselType) => {
      const snapIndex = api.selectedScrollSnap();
      const item = viewerItems[snapIndex];
      if (!item) return;
      const currentItem = readItemFromLocation();
      if (currentItem !== item.id) {
        setItemParam(item.id, "replace");
      }
    };

    onSelect(emblaApi);
    onSlidesInView(emblaApi);

    emblaApi.on("select", onSelect);
    emblaApi.on("slidesInView", onSlidesInView);
    emblaApi.on("settle", onSettle);
    emblaApi.on("reInit", syncControls);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("slidesInView", onSlidesInView);
      emblaApi.off("settle", onSettle);
      emblaApi.off("reInit", syncControls);
    };
  }, [addMountedIndexes, emblaApi, open, readItemFromLocation, setItemParam, viewerItems]);

  React.useEffect(() => {
    if (!open) {
      setMountedIndexes(new Set());
      return;
    }
    addMountedIndexes([selectedIndex - 1, selectedIndex, selectedIndex + 1]);
  }, [addMountedIndexes, open, selectedIndex]);

  React.useEffect(() => {
    if (!open || viewerItems.length === 0 || typeof window === "undefined") return;
    const current = viewerItems[selectedIndex];
    if (current) void preloadImage(current.src);
    const around = [selectedIndex - 1, selectedIndex + 1];
    around.forEach((index) => {
      const neighbor = viewerItems[index];
      if (!neighbor) return;
      void preloadImage(neighbor.src);
    });
  }, [open, preloadImage, selectedIndex, viewerItems]);

  React.useEffect(() => {
    setShowLoader(false);
    if (!open || !activeId) return;
    if (readyIds.has(activeId)) return;

    const delay = slowHint ? 250 : 300;
    const timer = window.setTimeout(() => {
      if (!readyIds.has(activeId)) {
        setShowLoader(true);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeId, open, readyIds, slowHint]);

  React.useEffect(() => {
    if (isActiveReady) setShowLoader(false);
  }, [isActiveReady]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (open && !wasOpenForScrollRef.current) {
      lastScrollYRef.current = window.scrollY;
    }
    if (!open && wasOpenForScrollRef.current) {
      const scrollY = lastScrollYRef.current;
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
    wasOpenForScrollRef.current = open;
  }, [open]);

  const hasMoreGridItems = visibleCount < viewerItems.length;
  const gridItems = React.useMemo(
    () => viewerItems.slice(0, Math.min(visibleCount, viewerItems.length)),
    [viewerItems, visibleCount],
  );

  React.useEffect(() => {
    if (open || !hasMoreGridItems || typeof window === "undefined") return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        const seen = entries.some((entry) => entry.isIntersecting);
        if (!seen) return;
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, viewerItems.length));
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreGridItems, open, viewerItems.length]);

  const openViewerAt = React.useCallback(
    (index: number) => {
      const item = viewerItems[index];
      if (!item) return;
      void preloadImage(item.src);
      setSelectedIndex(index);
      setOpenId(item.id);
      setShowLoader(false);
      setOpen(true);
      markViewerOpen();
      const currentItem = readItemFromLocation();
      if (currentItem !== item.id) {
        setItemParam(item.id, "push");
        openedWithPushRef.current = true;
      } else {
        openedWithPushRef.current = false;
      }
    },
    [markViewerOpen, preloadImage, readItemFromLocation, setItemParam, viewerItems],
  );

  const onOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        setOpenId(null);
        setShowLoader(false);
        const currentItem = readItemFromLocation();
        if (openedWithPushRef.current && currentItem) {
          openedWithPushRef.current = false;
          openPerfPendingRef.current = false;
          window.history.back();
          return;
        }
        if (currentItem) setItemParam(null, "replace");
        openedWithPushRef.current = false;
        openPerfPendingRef.current = false;
        return;
      }
      const item = viewerItems[selectedIndex];
      if (item) {
        setOpenId(item.id);
        setShowLoader(false);
        setItemParam(item.id, "replace");
      }
    },
    [readItemFromLocation, selectedIndex, setItemParam, viewerItems],
  );

  return (
    <>
      {!open ? (
        <section>
          <div className="grid-cards">
            {gridItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openViewerAt(index)}
                onPointerDown={() => {
                  void preloadImage(item.src);
                }}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm transition-[background-color,border-color] hover:border-border hover:bg-card/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:shadow-none"
                aria-label={t("pages.gallery.openImageAria", { title: item.title })}
                style={cardPerfStyle}
              >
                <div className="card-media-gallery relative overflow-hidden bg-muted/50 bg-gradient-to-br from-surface-1 to-surface-2">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                  <h2 className="t-small truncate font-medium text-foreground">{item.title}</h2>
                </div>
              </button>
            ))}
          </div>
          {hasMoreGridItems ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div ref={loadMoreSentinelRef} className="h-1 w-full" aria-hidden />
              <Button
                type="button"
                variant="outline"
                aria-label={t("pages.gallery.showMoreImagesAria")}
                onClick={() => {
                  setVisibleCount((current) => Math.min(current + PAGE_SIZE, viewerItems.length));
                }}
              >
                {t("common.showMore")}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {viewerItems.length > 0 ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            showCloseButton={false}
            className="left-0 top-0 z-[60] h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:max-w-none"
          >
            <DialogTitle className="sr-only">{t("pages.gallery.viewerTitle")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("pages.gallery.viewerDescription")}
            </DialogDescription>

            <div className="flex h-[100dvh] min-h-0 flex-col bg-background text-foreground pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
                <span className="tabular-nums inline-flex w-[9ch] items-center justify-center rounded-md bg-muted px-3 py-1 text-center text-xs font-medium text-foreground">
                  {selectedIndex + 1} / {viewerItems.length}
                </span>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-border/60 bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("pages.gallery.closeViewer")}
                  >
                    <X className="size-5" aria-hidden />
                  </Button>
                </DialogClose>
              </div>

              <div className="relative flex-1 min-h-0">
                {debugCarousel ? (
                  <div className="pointer-events-none absolute left-4 top-2 z-20 rounded-md border border-border/60 bg-background/90 px-2 py-1 text-[11px] text-muted-foreground">
                    {`items=${viewerItems.length} mounted=${mountedIndexes.size} api=${Boolean(emblaApi)} index=${selectedIndex} ready=${String(isActiveReady)}`}
                  </div>
                ) : null}
                {showLoader && !isActiveReady ? (
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                    aria-live="polite"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      {t("pages.gallery.imageLoading")}
                    </div>
                  </div>
                ) : null}
                <div className="relative h-full">
                  <div ref={emblaViewportRef} className="h-full overflow-hidden [touch-action:pan-y]">
                    <div className="flex h-full" style={{ willChange: "transform" }}>
                      {viewerItems.map((item, index) => {
                        const isSlideMounted = mountedIndexes.has(index);
                        return (
                          <div
                            key={item.id}
                            role="group"
                            aria-roledescription="slide"
                            className="h-full min-w-0 flex-[0_0_100%] overflow-hidden bg-background"
                          >
                            <div className="relative mx-auto h-full w-full max-w-[min(100vw,900px)] overflow-hidden bg-background [transform:translateZ(0)]">
                              {isSlideMounted ? (
                                <Image
                                  src={item.src}
                                  alt={item.alt}
                                  fill
                                  unoptimized
                                  sizes="100vw"
                                  priority={index === selectedIndex}
                                  loading={index === selectedIndex ? "eager" : "lazy"}
                                  onLoad={() => {
                                    markReady(item.id);
                                    if (item.id === activeId) measureViewerReady();
                                  }}
                                  onError={() => {
                                    markReady(item.id);
                                  }}
                                  className="select-none object-contain"
                                  draggable={false}
                                />
                              ) : (
                                <div className="h-full w-full" aria-hidden />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {viewerItems.length > 1 ? (
                    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => emblaApi?.scrollPrev()}
                        disabled={!canScrollPrev}
                        className="pointer-events-auto absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-border/60 bg-background/90 text-foreground transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                        aria-label={t("pages.gallery.previousSlide")}
                      >
                        <ChevronLeft className="size-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => emblaApi?.scrollNext()}
                        disabled={!canScrollNext}
                        className="pointer-events-auto absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-border/60 bg-background/90 text-foreground transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                        aria-label={t("pages.gallery.nextSlide")}
                      >
                        <ChevronRight className="size-5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
