"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { changeOwnPassword } from "@/actions/account";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const RULES = [
  { label: "Minimal 8 karakter", test: (v: string) => v.length >= 8 },
  { label: "Memuat huruf", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Memuat angka", test: (v: string) => /[0-9]/.test(v) },
];

function PasswordInput({ name, autoComplete, onChange }: { name: string; autoComplete: string; onChange?: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        className="pr-11"
        onChange={(e) => onChange?.(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-brand-600"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordForm() {
  const [value, setValue] = useState("");
  return (
    <ActionForm action={changeOwnPassword} resetOnSuccess>
      <Field label="Password saat ini">
        <PasswordInput name="currentPassword" autoComplete="current-password" />
      </Field>
      <Field label="Password baru">
        <PasswordInput name="newPassword" autoComplete="new-password" onChange={setValue} />
      </Field>
      <ul className="grid gap-1.5 sm:grid-cols-3">
        {RULES.map((r) => {
          const ok = r.test(value);
          return (
            <li
              key={r.label}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold ring-1 transition",
                ok ? "bg-mint-50 text-mint-700 ring-mint-200" : "bg-slate-50 text-slate-500 ring-slate-200",
              )}
            >
              <Check className={cn("size-3.5", ok ? "opacity-100" : "opacity-30")} strokeWidth={3} /> {r.label}
            </li>
          );
        })}
      </ul>
      <Field label="Ulangi password baru">
        <PasswordInput name="confirmPassword" autoComplete="new-password" />
      </Field>
      <SubmitButton pendingText="Menyimpan…">
        <KeyRound className="size-4" /> Ganti password
      </SubmitButton>
    </ActionForm>
  );
}
