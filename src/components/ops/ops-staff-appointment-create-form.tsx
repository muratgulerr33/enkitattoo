"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LoaderCircle,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import {
  createStaffAppointmentCustomerAction,
  createStaffServiceSessionAction,
  type OpsAppointmentActionState,
  type OpsAppointmentCustomerCreateActionState,
  searchStaffAppointmentCustomersAction,
  updateStaffAppointmentAction,
  updateStaffWalkInAction,
} from "@/app/ops/randevular/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserRole } from "@/db/schema/users";
import { formatAppointmentDateLong } from "@/lib/ops/appointment-calendar";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

const INITIAL_CUSTOMER_CREATE_STATE: OpsAppointmentCustomerCreateActionState = {
  error: null,
  success: null,
  createdCustomer: null,
};

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/90 dark:bg-surface-1/78";

type StaffAppointmentCreateFormProps = {
  customerOptions: Array<{
    id: number;
    label: string;
    email: string | null;
    phone: string | null;
  }>;
  artistOptions: Array<{
    id: number;
    label: string;
  }>;
  currentStaffUserId: number;
  currentStaffRoles: UserRole[];
  onCustomerCreated?: (customer: {
    id: number;
    label: string;
    email: string | null;
    phone: string | null;
  }) => void;
  defaultDate: string;
  defaultTime: string;
  defaultCustomerUserId?: number;
  defaultCustomerLabel?: string;
  defaultCustomerEmail?: string | null;
  defaultCustomerPhone?: string | null;
  defaultArtistUserId?: number | null;
  defaultNotes?: string | null;
  defaultServiceType?: "tattoo" | "piercing";
  defaultTotalAmountCents?: number | null;
  defaultCollectedAmountCents?: number | null;
  appointmentId?: number;
  serviceIntakeId?: number;
  source?: "appointment" | "walk_in";
  mode?: "create" | "edit";
  submitLabel?: string;
  onSuccess?: () => void;
  dateMode?: "context" | "editable";
};

type SessionSource = "appointment" | "walk_in";
type CustomerPickerMode = "results" | "create";
type AppointmentCustomerPickerOption = StaffAppointmentCreateFormProps["customerOptions"][number];

function toAmountInputValue(
  cents?: number | null,
  options?: { fallback?: string; emptyWhenZero?: boolean }
): string {
  const fallback = options?.fallback ?? "";

  if (typeof cents !== "number" || Number.isNaN(cents)) {
    return fallback;
  }

  if (options?.emptyWhenZero && cents === 0) {
    return "";
  }

  return (cents / 100)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")
    .replace(".", ",");
}

function getDefaultArtistUserId(input: {
  artistOptions: Array<{
    id: number;
    label: string;
  }>;
  currentStaffUserId: number;
  currentStaffRoles: UserRole[];
  defaultArtistUserId?: number | null;
}): string {
  if (
    typeof input.defaultArtistUserId === "number" &&
    input.artistOptions.some((artist) => artist.id === input.defaultArtistUserId)
  ) {
    return input.defaultArtistUserId.toString();
  }

  const isPureArtist =
    input.currentStaffRoles.includes("artist") && !input.currentStaffRoles.includes("admin");

  if (isPureArtist) {
    const currentArtist = input.artistOptions.find(
      (artist) => artist.id === input.currentStaffUserId
    );

    if (currentArtist) {
      return currentArtist.id.toString();
    }
  }

  if (input.artistOptions.length === 1) {
    return input.artistOptions[0].id.toString();
  }

  return "";
}

function resolveInitialSelectedCustomer(input: {
  customerOptions: AppointmentCustomerPickerOption[];
  defaultCustomerUserId?: number;
  defaultCustomerLabel?: string;
  defaultCustomerEmail?: string | null;
  defaultCustomerPhone?: string | null;
}): AppointmentCustomerPickerOption | null {
  if (typeof input.defaultCustomerUserId === "number") {
    const matchedCustomer = input.customerOptions.find(
      (customer) => customer.id === input.defaultCustomerUserId
    );

    if (matchedCustomer) {
      return matchedCustomer;
    }

    return {
      id: input.defaultCustomerUserId,
      label: input.defaultCustomerLabel ?? `Kullanıcı #${input.defaultCustomerUserId}`,
      email: input.defaultCustomerEmail ?? null,
      phone: input.defaultCustomerPhone ?? null,
    };
  }

  return input.customerOptions[0] ?? null;
}

function getCustomerPickerMeta(customer: AppointmentCustomerPickerOption): string | null {
  if (customer.phone && customer.email) {
    return `${customer.phone} · ${customer.email}`;
  }

  return customer.phone ?? customer.email ?? null;
}

export function OpsStaffAppointmentCreateForm({
  customerOptions,
  artistOptions,
  currentStaffUserId,
  currentStaffRoles,
  onCustomerCreated,
  defaultDate,
  defaultTime,
  defaultCustomerUserId,
  defaultCustomerLabel,
  defaultCustomerEmail,
  defaultCustomerPhone,
  defaultArtistUserId,
  defaultNotes,
  defaultServiceType = "tattoo",
  defaultTotalAmountCents,
  defaultCollectedAmountCents,
  appointmentId,
  serviceIntakeId,
  source = "appointment",
  mode = "create",
  submitLabel,
  onSuccess,
  dateMode = "editable",
}: StaffAppointmentCreateFormProps) {
  const resolvedDefaultArtistUserId = getDefaultArtistUserId({
    artistOptions,
    currentStaffUserId,
    currentStaffRoles,
    defaultArtistUserId,
  });
  const [sessionSource, setSessionSource] = useState<SessionSource>(source);
  const action =
    mode === "edit"
      ? sessionSource === "walk_in"
        ? updateStaffWalkInAction
        : updateStaffAppointmentAction
      : createStaffServiceSessionAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [inlineCustomerState, setInlineCustomerState] = useState(INITIAL_CUSTOMER_CREATE_STATE);
  const [inlineCustomerForm, setInlineCustomerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [showInlineCustomerEmail, setShowInlineCustomerEmail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AppointmentCustomerPickerOption | null>(
    () =>
      resolveInitialSelectedCustomer({
        customerOptions,
        defaultCustomerUserId,
        defaultCustomerLabel,
        defaultCustomerEmail,
        defaultCustomerPhone,
      })
  );
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [customerPickerMode, setCustomerPickerMode] = useState<CustomerPickerMode>("results");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState(customerOptions);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const [selectedArtistUserId, setSelectedArtistUserId] = useState(resolvedDefaultArtistUserId);
  const [createCustomerPending, startCreateCustomerTransition] = useTransition();
  const [customerSearchPending, startCustomerSearchTransition] = useTransition();
  const [totalAmountInput, setTotalAmountInput] = useState(() =>
    toAmountInputValue(defaultTotalAmountCents)
  );
  const [collectedAmountInput, setCollectedAmountInput] = useState(() =>
    toAmountInputValue(defaultCollectedAmountCents, {
      emptyWhenZero: mode === "create",
    })
  );
  const isDisabled = pending || createCustomerPending;
  const selectedCustomerUserId = selectedCustomer?.id.toString() ?? "";

  useEffect(() => {
    setSessionSource(source);
  }, [source]);

  useEffect(() => {
    setSelectedArtistUserId((current) => {
      if (current && artistOptions.some((artist) => artist.id.toString() === current)) {
        return current;
      }

      return resolvedDefaultArtistUserId;
    });
  }, [artistOptions, resolvedDefaultArtistUserId]);

  useEffect(() => {
    setTotalAmountInput(toAmountInputValue(defaultTotalAmountCents));
  }, [defaultTotalAmountCents]);

  useEffect(() => {
    setCollectedAmountInput(
      toAmountInputValue(defaultCollectedAmountCents, {
        emptyWhenZero: mode === "create",
      })
    );
  }, [defaultCollectedAmountCents, mode]);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  useEffect(() => {
    setCustomerSearchResults((current) =>
      customerSearchQuery.trim() ? current : customerOptions
    );

    setSelectedCustomer((current) => {
      if (!current) {
        return customerOptions[0] ?? null;
      }

      return customerOptions.find((customer) => customer.id === current.id) ?? current;
    });
  }, [customerOptions, customerSearchQuery]);

  useEffect(() => {
    if (!customerPickerOpen || customerPickerMode !== "results") {
      return;
    }

    const trimmedQuery = customerSearchQuery.trim();

    if (!trimmedQuery) {
      setCustomerSearchError(null);
      setCustomerSearchResults(customerOptions);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      startCustomerSearchTransition(async () => {
        const result = await searchStaffAppointmentCustomersAction(trimmedQuery);

        if (cancelled) {
          return;
        }

        setCustomerSearchError(result.error);
        setCustomerSearchResults(result.customers);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    customerOptions,
    customerPickerMode,
    customerPickerOpen,
    customerSearchQuery,
    startCustomerSearchTransition,
  ]);

  function handleCustomerSelect(customer: AppointmentCustomerPickerOption) {
    setSelectedCustomer(customer);
    setCustomerPickerOpen(false);
    setCustomerPickerMode("results");
    setCustomerSearchQuery("");
    setCustomerSearchError(null);
    setInlineCustomerState(INITIAL_CUSTOMER_CREATE_STATE);
  }

  async function handleInlineCustomerCreate() {
    const formData = new FormData();
    formData.set("fullName", inlineCustomerForm.fullName);
    formData.set("phone", inlineCustomerForm.phone);
    formData.set("email", inlineCustomerForm.email);

    startCreateCustomerTransition(async () => {
      let result: OpsAppointmentCustomerCreateActionState;

      try {
        result = await createStaffAppointmentCustomerAction(
          INITIAL_CUSTOMER_CREATE_STATE,
          formData
        );
      } catch {
        result = {
          error: "Müşteri oluşturulamadı.",
          success: null,
          createdCustomer: null,
        };
      }

      setInlineCustomerState(result);

      if (!result.createdCustomer) {
        return;
      }

      const createdCustomer = result.createdCustomer;

      onCustomerCreated?.(createdCustomer);
      setSelectedCustomer(createdCustomer);
      setCustomerSearchResults((current) => {
        const withoutDuplicate = current.filter((customer) => customer.id !== createdCustomer.id);
        return [createdCustomer, ...withoutDuplicate];
      });
      setInlineCustomerForm({
        fullName: "",
        phone: "",
        email: "",
      });
      setShowInlineCustomerEmail(false);
      setCustomerPickerMode("results");
      setCustomerSearchQuery("");
      setCustomerSearchError(null);
      setCustomerPickerOpen(false);
    });
  }

  const defaultSubmitLabel = mode === "edit" ? "İşlemi güncelle" : "İşlem kaydı aç";

  return (
    <form
      action={formAction}
      noValidate
      className={cn("space-y-4", mode === "create" && "space-y-3.5")}
      data-testid={mode === "edit" ? "appointment-edit-form" : "appointment-create-form"}
    >
      <input type="hidden" name="sessionSource" value={sessionSource} />

      {mode === "edit" && appointmentId ? (
        <input type="hidden" name="appointmentId" value={appointmentId} />
      ) : null}

      {mode === "edit" && serviceIntakeId ? (
        <input type="hidden" name="serviceIntakeId" value={serviceIntakeId} />
      ) : null}

      <div className={cn("grid gap-4 pb-1", mode === "create" && "gap-3.5")}>
        {dateMode === "context" ? (
          <>
            <input type="hidden" name="scheduledDate" value={defaultDate} />
            <div className="rounded-xl bg-surface-1/55 px-3.5 py-2 dark:bg-surface-1/76">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground dark:text-muted-foreground/92">
                Tarih
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarDays className="size-4 text-muted-foreground dark:text-muted-foreground/90" aria-hidden />
                {formatAppointmentDateLong(defaultDate)}
              </p>
            </div>
          </>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Saat</Label>
            <div className="relative">
              <Clock3
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="scheduledTime"
                name="scheduledTime"
                type="time"
                defaultValue={defaultTime}
                step={1800}
                className="pl-9 dark:border-border/90 dark:bg-surface-1/78"
                disabled={isDisabled}
              />
            </div>
          </div>

          {dateMode === "editable" ? (
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Tarih</Label>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  defaultValue={defaultDate}
                  className="pl-9 dark:border-border/90 dark:bg-surface-1/78"
                  disabled={isDisabled}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="serviceType">İşlem tipi</Label>
            <div className="relative rounded-xl border border-border bg-background dark:border-border/90 dark:bg-surface-1/78">
              <select
                id="serviceType"
                name="serviceType"
                defaultValue={defaultServiceType}
                className={cn(
                  selectClassName,
                  "h-11 rounded-xl border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
                )}
                disabled={isDisabled}
              >
                <option value="tattoo">Dövme</option>
                <option value="piercing">Piercing</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistUserId">Artist</Label>
            <div className="relative rounded-xl border border-border bg-background dark:border-border/90 dark:bg-surface-1/78">
              <select
                id="artistUserId"
                name="artistUserId"
                value={selectedArtistUserId}
                className={cn(
                  selectClassName,
                  "h-11 rounded-xl border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
                )}
                disabled={isDisabled || !artistOptions.length}
                onChange={(event) => setSelectedArtistUserId(event.target.value)}
                data-testid="artist-select"
              >
                {artistOptions.length > 1 ? <option value="">Artist seçin</option> : null}
                {artistOptions.length ? (
                  artistOptions.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.label}
                    </option>
                  ))
                ) : (
                  <option value="">Aktif artist yok</option>
                )}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
            {!artistOptions.length ? (
              <p className="text-xs leading-5 text-muted-foreground dark:text-muted-foreground/92">
                İşlem kaydı açmak için önce aktif bir artist hesabı gerekli.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Toplam tutar (TL)</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="text"
              inputMode="decimal"
              value={totalAmountInput}
              className="h-11 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              disabled={isDisabled}
              onChange={(event) => setTotalAmountInput(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectedAmount">Kapora (TL)</Label>
            <Input
              id="collectedAmount"
              name="collectedAmount"
              type="text"
              inputMode="decimal"
              value={collectedAmountInput}
              className="h-11 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              disabled={isDisabled}
              onChange={(event) => setCollectedAmountInput(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="customerPickerTrigger">Müşteri</Label>
          <input type="hidden" name="customerUserId" value={selectedCustomerUserId} />

          <Button
            id="customerPickerTrigger"
            type="button"
            variant="outline"
            className="h-12 w-full justify-between rounded-xl px-3 text-left dark:border-border/90 dark:bg-surface-1/72 dark:hover:bg-surface-1/84"
            disabled={isDisabled}
            data-testid="customer-picker-trigger"
            onClick={() => {
              setCustomerPickerOpen(true);
              setCustomerPickerMode("results");
              setCustomerSearchQuery("");
              setCustomerSearchError(null);
              setCustomerSearchResults(customerOptions);
              setInlineCustomerState(INITIAL_CUSTOMER_CREATE_STATE);
              setShowInlineCustomerEmail(false);
            }}
          >
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span
                className={cn(
                  "min-w-0 truncate text-sm font-medium",
                  selectedCustomer ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {selectedCustomer ? selectedCustomer.label : "Müşteri seçin"}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Button>

          {inlineCustomerState.success ? (
            <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-surface-1/72">
              {inlineCustomerState.success}
            </p>
          ) : null}

          <Dialog
            open={customerPickerOpen}
            onOpenChange={(open) => {
              setCustomerPickerOpen(open);

              if (!open) {
                setCustomerPickerMode("results");
                setCustomerSearchQuery("");
                setCustomerSearchError(null);
                setCustomerSearchResults(customerOptions);
                setShowInlineCustomerEmail(false);
              }
            }}
          >
            <DialogContent
              showCloseButton
              className="top-auto bottom-2 left-1/2 flex min-h-0 h-[min(84vh,calc(100vh-1rem))] w-[calc(100%-1rem)] max-w-none translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden rounded-[2rem] border bg-background p-0 dark:border-border/90 dark:bg-card/96 sm:h-[min(82vh,calc(100vh-2rem))] sm:max-w-[36rem] md:max-w-[38rem] lg:top-1/2 lg:bottom-auto lg:h-[min(78vh,42rem)] lg:max-h-[min(78vh,42rem)] lg:max-w-[34rem] lg:translate-y-[-50%]"
            >
              <DialogHeader className="border-b px-4 py-3 text-left dark:border-border/90 dark:bg-surface-1/62 sm:px-5">
                <DialogTitle>Müşteri seç</DialogTitle>
                <DialogDescription className="sr-only">
                  İşlem için müşteri seçin veya yeni müşteri oluşturun.
                </DialogDescription>
              </DialogHeader>

              {customerPickerMode === "results" ? (
                <>
                  <div className="border-b px-4 py-3 sm:px-5">
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        value={customerSearchQuery}
                        onChange={(event) => setCustomerSearchQuery(event.target.value)}
                        placeholder="Ad soyad, telefon veya e-posta ile ara"
                        className="h-11 rounded-xl pl-9 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
                        disabled={isDisabled}
                        data-testid="customer-picker-search"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground/92">
                        {customerSearchPending
                          ? "Müşteriler aranıyor..."
                          : customerSearchQuery.trim()
                            ? `${customerSearchResults.length} müşteri bulundu`
                            : "Yakın müşteriler"}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg px-2 text-xs dark:text-muted-foreground/92 dark:hover:bg-surface-1/72"
                        disabled={isDisabled}
                        onClick={() => {
                          setCustomerPickerMode("create");
                          setInlineCustomerState(INITIAL_CUSTOMER_CREATE_STATE);
                          setInlineCustomerForm({
                            fullName: "",
                            phone: "",
                            email: "",
                          });
                          setShowInlineCustomerEmail(false);
                        }}
                      >
                        <UserPlus className="size-3.5" aria-hidden />
                        Yeni müşteri
                      </Button>
                    </div>

                    {customerSearchError ? (
                      <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        {customerSearchError}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-4 sm:px-5">
                    {customerSearchResults.length ? (
                      <div className="space-y-2">
                        {customerSearchResults.map((customer) => {
                          const isSelected = selectedCustomer?.id === customer.id;
                          const supportText = getCustomerPickerMeta(customer);

                          return (
                            <button
                              key={customer.id}
                              type="button"
                              className={cn(
                                "w-full rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:bg-surface-1/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isSelected
                                  ? "border-foreground/30 bg-surface-1/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] dark:border-border/95 dark:bg-surface-1/88"
                                  : "border-border bg-card dark:border-border/90 dark:bg-card/96 dark:hover:bg-surface-1/76"
                              )}
                              data-testid={`customer-picker-option-${customer.id}`}
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {customer.label}
                                  </p>
                                  {supportText ? (
                                    <p className="mt-1 truncate text-xs text-muted-foreground dark:text-muted-foreground/88">
                                      {supportText}
                                    </p>
                                  ) : null}
                                </div>

                                {isSelected ? (
                                  <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[1.35rem] border border-dashed border-border bg-surface-1/20 px-4 py-4 dark:border-border/80 dark:bg-surface-1/50">
                        <p className="text-sm font-medium text-foreground">Müşteri bulunamadı.</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Aramayı değiştirin veya yeni müşteri ekleyin.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b px-4 py-3 dark:border-border/90 dark:bg-surface-1/38 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Yeni müşteri</p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground/92">
                          Ad soyad ve telefonla hızlıca ekleyin.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg px-2 text-xs dark:text-muted-foreground/92 dark:hover:bg-surface-1/72"
                        disabled={isDisabled}
                        onClick={() => {
                          setCustomerPickerMode("results");
                          setInlineCustomerState(INITIAL_CUSTOMER_CREATE_STATE);
                          setShowInlineCustomerEmail(false);
                        }}
                      >
                        Listeden seç
                      </Button>
                    </div>
                  </div>

                  <div
                    className="min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-6 sm:px-5"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || isDisabled) {
                        return;
                      }

                      event.preventDefault();
                      void handleInlineCustomerCreate();
                    }}
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="inlineCustomerFullName">Ad soyad</Label>
                        <Input
                          id="inlineCustomerFullName"
                          value={inlineCustomerForm.fullName}
                          onChange={(event) =>
                            setInlineCustomerForm((current) => ({
                              ...current,
                              fullName: event.target.value,
                            }))
                          }
                          className="h-10 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78"
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="inlineCustomerPhone">Telefon</Label>
                        <Input
                          id="inlineCustomerPhone"
                          type="tel"
                          inputMode="tel"
                          placeholder="05xx xxx xx xx"
                          value={inlineCustomerForm.phone}
                          onChange={(event) =>
                            setInlineCustomerForm((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          className="h-10 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78"
                          disabled={isDisabled}
                        />
                      </div>

                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg px-2 text-xs text-muted-foreground dark:text-muted-foreground/92 dark:hover:bg-surface-1/72"
                          disabled={isDisabled}
                          onClick={() => setShowInlineCustomerEmail((current) => !current)}
                        >
                          {showInlineCustomerEmail
                            ? "E-posta alanını gizle"
                            : "E-posta ekle (opsiyonel)"}
                        </Button>

                        {showInlineCustomerEmail ? (
                          <div className="mt-2 space-y-1.5">
                            <Label htmlFor="inlineCustomerEmail">E-posta</Label>
                            <Input
                              id="inlineCustomerEmail"
                              type="email"
                              inputMode="email"
                              placeholder="ornek@mail.com"
                              value={inlineCustomerForm.email}
                              onChange={(event) =>
                                setInlineCustomerForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              className="h-10 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78"
                              disabled={isDisabled}
                            />
                          </div>
                        ) : null}
                      </div>

                      {inlineCustomerState.error ? (
                        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                          {inlineCustomerState.error}
                        </p>
                      ) : null}

                      <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border/70 bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/88 dark:border-border/85 dark:bg-card/92 supports-[backdrop-filter]:dark:bg-card/86 sm:-mx-5 sm:px-5">
                        <Button
                          type="button"
                          size="cta"
                          className="w-full"
                          disabled={isDisabled}
                          data-testid="customer-picker-create-button"
                          onClick={handleInlineCustomerCreate}
                        >
                          {createCustomerPending ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" aria-hidden />
                              Oluşturuluyor
                            </>
                          ) : (
                            "Müşteri oluştur"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Not</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Kısa not"
            rows={mode === "create" ? 2 : 3}
            defaultValue={defaultNotes ?? ""}
            className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={isDisabled}
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-surface-1/72">
          {state.success}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 border-t border-border/80 bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/88 dark:border-border/85 dark:bg-card/92 supports-[backdrop-filter]:dark:bg-card/86 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-0">
        <Button
          type="submit"
          size="cta"
          className={cn("w-full", mode === "edit" && "sm:w-auto")}
          disabled={isDisabled}
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              {mode === "edit" ? "Güncelleniyor" : "Kaydediliyor"}
            </>
          ) : (
            submitLabel ?? defaultSubmitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
