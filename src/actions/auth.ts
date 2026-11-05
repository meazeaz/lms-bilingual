"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { failure, type ActionState } from "@/lib/action-state";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const HOME = { ADMIN: "/admin", TEACHER: "/guru", STUDENT: "/siswa" } as const;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(parsed.error.issues[0].message);

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && user.active && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!valid) return failure("Email atau password salah.");

  await createSession({ userId: user.id, role: user.role });
  redirect(HOME[user.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
