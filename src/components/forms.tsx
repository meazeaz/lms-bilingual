"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { buttonClass, type ButtonVariant } from "@/components/ui";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingText = "Menyimpan…",
  name,
  value,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  pendingText?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={buttonClass(variant, size, className)}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  return (
    <AnimatePresence mode="wait">
      {state?.message && (
        <motion.div
          key={state.message + String(state.ok) + (state.ts ?? 0)}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          role="status"
          className={cn(
            "flex items-start gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold ring-1",
            state.ok ? "bg-mint-50 text-mint-700 ring-mint-200" : "bg-rose-50 text-rose-700 ring-rose-200",
          )}
        >
          {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
          <span>{state.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Form yang terhubung ke Server Action dengan useActionState.
 * Pesan dari server tampil otomatis; form direset saat sukses bila resetOnSuccess.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  messagePosition = "bottom",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  messagePosition?: "top" | "bottom";
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={cn("space-y-4", className)}>
      {messagePosition === "top" && <FormMessage state={state} />}
      {children}
      {messagePosition === "bottom" && <FormMessage state={state} />}
    </form>
  );
}

/** Pemilih skor 1–4 bergaya tombol tanah liat (rubrik penilaian). */
export function ScorePicker({ name, label, hint, defaultValue = 3, onChange }: { name: string; label: string; hint?: string; defaultValue?: number; onChange?: (v: number) => void }) {
  const [value, setValue] = useState(defaultValue);
  const labels = ["Kurang", "Cukup", "Baik", "Sangat Baik"];
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-500">{labels[value - 1]}</span>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => {
              setValue(n);
              onChange?.(n);
            }}
            className={cn(
              "press h-10 rounded-xl border text-sm font-black transition",
              value === n ? "border-brand-700 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
            )}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
