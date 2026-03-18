"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CalendarDays, ChevronDown, Clock3, LoaderCircle, UserPlus, Users } from "lucide-react";
import {
  createStaffAppointmentAction,
  createStaffAppointmentCustomerAction,
  type OpsAppointmentActionState,
  type OpsAppointmentCustomerCreateActionState,
  updateStaffAppointmentAction,
} from "@/app/ops/randevular/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

type StaffAppointmentCreateFormProps = {
  customerOptions: Array<{
    id: number;
    label: string;
    email: string | null;
  }>;
  onCustomerCreated?: (customer: {
    id: number;
    label: string;
    email: string | null;
  }) => void;
  defaultDate: string;
  defaultTime: string;
  defaultCustomerUserId?: number;
  defaultNotes?: string | null;
  appointmentId?: number;
  mode?: "create" | "edit";
  submitLabel?: string;
  onSuccess?: () => void;
  dateMode?: "context" | "editable";
};

type CustomerMode = "existing" | "new";

export function OpsStaffAppointmentCreateForm({
  customerOptions,
  onCustomerCreated,
  defaultDate,
  defaultTime,
  defaultCustomerUserId,
  defaultNotes,
  appointmentId,
  mode = "create",
  submitLabel,
  onSuccess,
  dateMode = "editable",
}: StaffAppointmentCreateFormProps) {
  const action = mode === "edit" ? updateStaffAppointmentAction : createStaffAppointmentAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [customerMode, setCustomerMode] = useState<CustomerMode>(
    customerOptions.length ? "existing" : "new"
  );
  const [inlineCustomerState, setInlineCustomerState] = useState(INITIAL_CUSTOMER_CREATE_STATE);
  const [inlineCustomerForm, setInlineCustomerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [selectedCustomerUserId, setSelectedCustomerUserId] = useState(
    (defaultCustomerUserId ?? customerOptions[0]?.id)?.toString() ?? ""
  );
  const [createCustomerPending, startCreateCustomerTransition] = useTransition();
  const isDisabled = pending || createCustomerPending;
  const selectedCustomer =
    customerOptions.find((option) => option.id.toString() === selectedCustomerUserId) ?? null;
  const isExistingMode = customerMode === "existing";

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  useEffect(() => {
    if (!customerOptions.length) {
      setCustomerMode("new");
      return;
    }

    if (!selectedCustomerUserId) {
      setSelectedCustomerUserId(customerOptions[0]?.id?.toString() ?? "");
    }
  }, [customerOptions, selectedCustomerUserId]);

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

      onCustomerCreated?.(result.createdCustomer);
      setSelectedCustomerUserId(result.createdCustomer.id.toString());
      setInlineCustomerForm({
        fullName: "",
        phone: "",
        email: "",
      });
      setCustomerMode("existing");
    });
  }

  return (
    <form
      action={formAction}
      className={cn("space-y-4", mode === "create" && "space-y-3.5")}
      data-testid={mode === "edit" ? "appointment-edit-form" : "appointment-create-form"}
    >
      {mode === "edit" && appointmentId ? (
        <input type="hidden" name="appointmentId" value={appointmentId} />
      ) : null}

      <div className={cn("grid gap-4", mode === "create" && "gap-3.5")}>
        {dateMode === "context" ? (
          <>
            <input type="hidden" name="appointmentDate" value={defaultDate} />
            <div className="rounded-xl bg-surface-1/55 px-3.5 py-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Tarih
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                {formatAppointmentDateLong(defaultDate)}
              </p>
            </div>
          </>
        ) : null}

        <div
          className={cn(
            "grid gap-4",
            dateMode === "editable"
              ? "sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              : "sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Saat</Label>
            <div className="relative">
              <Clock3
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="appointmentTime"
                name="appointmentTime"
                type="time"
                defaultValue={defaultTime}
                step={1800}
                className="pl-9"
                disabled={isDisabled}
                required
              />
            </div>
          </div>

          {dateMode === "editable" ? (
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Tarih</Label>
              <div className="relative rounded-2xl border border-border bg-surface-1/40 px-3 py-1.5">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  defaultValue={defaultDate}
                  className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                  disabled={isDisabled}
                  required
                />
              </div>
            </div>
          ) : null}
        </div>

        {mode === "create" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="serviceType">İşlem tipi</Label>
              <div className="relative rounded-xl border border-border bg-background">
                <select
                  id="serviceType"
              name="serviceType"
                  defaultValue="tattoo"
                  className={cn(
                    selectClassName,
                    "h-11 rounded-xl border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
                  )}
                  disabled={isDisabled}
                  required
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
              <Label htmlFor="totalAmount">Toplam tutar (TL)</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                inputMode="decimal"
                min="0"
               step="0.01"
                placeholder="9000"
                className="h-11 rounded-xl bg-background"
                disabled={isDisabled}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectedAmount">Alınan tutar (TL)</Label>
              <Input
                id="collectedAmount"
                name="collectedAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue="0"
                placeholder="4000"
                className="h-11 rounded-xl bg-background"
                disabled={isDisabled}
                required
              />
              <p className="text-xs text-muted-foreground">Kapora veya ilk tahsilatı yazın.</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <Label>Müşteri</Label>

          <Tabs
            value={customerMode}
            onValueChange={(value) => {
              setCustomerMode(value as CustomerMode);
              setInlineCustomerState((current) =>
                current.success ? current : { ...current, error: null }
              );
            }}
            className="gap-3"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-surface-1/60 p-1">
              <TabsTrigger
                value="existing"
                disabled={!customerOptions.length || isDisabled}
                className="min-h-10 rounded-xl px-3"
              >
                <Users className="size-4" aria-hidden />
                Mevcut müşteri
              </TabsTrigger>
              <TabsTrigger
                value="new"
                disabled={isDisabled}
                className="min-h-10 rounded-xl px-3"
              >
                <UserPlus className="size-4" aria-hidden />
                Yeni müşteri
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isExistingMode ? (
            <div className="rounded-2xl border border-border bg-surface-1/45 p-3.5">
              <div className="rounded-xl border border-border/80 bg-background/85 px-3.5 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Seçili müşteri
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {selectedCustomer?.label ?? "Müşteri seçin"}
                </p>
                <p className="mt-0.5 break-words text-sm text-muted-foreground">
                  {selectedCustomer
                    ? (selectedCustomer.email ?? "E-posta yok.")
                    : "Kayıtlı müşteri listesinden seçim yapın."}
                </p>
              </div>

              <div className="relative mt-3 rounded-xl border border-border bg-background">
                <select
                  id="customerUserId"
                  name="customerUserId"
                  value={selectedCustomerUserId}
                  className={cn(
                    selectClassName,
                    "h-11 rounded-xl border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
                  )}
                  disabled={isDisabled}
                  onChange={(event) => setSelectedCustomerUserId(event.target.value)}
                  required
                >
                  {customerOptions.length ? (
                    customerOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.email ? `${option.label} · ${option.email}` : option.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Önce müşteri oluşturun</option>
                  )}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              </div>

              {inlineCustomerState.success ? (
                <p className="mt-3 rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
                  {inlineCustomerState.success}
                </p>
              ) : null}
            </div>
          ) : (
            <div
              className="rounded-2xl border border-border bg-surface-1/45 p-3.5"
              onKeyDown={(event) => {
                if (event.key !== "Enter" || isDisabled) {
                  return;
                }

                event.preventDefault();
                void handleInlineCustomerCreate();
              }}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Hızlı müşteri</p>
                <p className="text-xs text-muted-foreground">Randevu akışından çıkmadan ekleyin.</p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
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
                    className="h-10 rounded-xl bg-background"
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
                    className="h-10 rounded-xl bg-background"
                    disabled={isDisabled}
                  />
                </div>

                <div className="space-y-1.5">
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
                    className="h-10 rounded-xl bg-background"
                    disabled={isDisabled}
                  />
                </div>
              </div>

              {inlineCustomerState.error ? (
                <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {inlineCustomerState.error}
                </p>
              ) : null}

              <Button
                type="button"
                size="cta"
                className="mt-3 w-full sm:w-auto"
                disabled={isDisabled}
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
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Not</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Kısa not"
            rows={mode === "create" ? 2 : 3}
            defaultValue={defaultNotes ?? ""}
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
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
          {state.success}
        </p>
      ) : null}

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
          submitLabel ?? (mode === "edit" ? "Kaydı güncelle" : "Randevu aç")
        )}
      </Button>
    </form>
  );
}
