"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/actions/auth";
import { Field, Input } from "@/components/ui";
import { FormMessage, SubmitButton } from "@/components/forms";

export function LoginForm() {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <Input id="email" name="email" type="email" autoComplete="username" placeholder="nama@almadany.sch.id" required />
      </Field>
      <Field label="Password">
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full" pendingText="Memeriksa…">
        <LogIn className="size-4" /> Masuk
      </SubmitButton>
    </form>
  );
}
