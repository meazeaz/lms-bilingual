"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireTeacher } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { failure, type ActionState } from "@/lib/action-state";
import { getSchoolProfile } from "@/lib/settings-server";

const StepSchema = z.object({
  sequence: z.string().trim().min(1, { error: "Nama kegiatan pada langkah pembelajaran wajib diisi." }).max(200),
  minutes: z.coerce.number().int().min(0).max(240),
  tag: z.string().trim().max(60).nullish(),
  details: z.array(z.string().trim().max(2000)).max(40),
});

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optional = (fd: FormData, k: string) => text(fd, k) || null;
const lineList = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** Isi modul dari formulir editor (dipakai admin & guru). */
function readContent(fd: FormData, copy: boolean): { ok: true; data: Record<string, unknown> } | { ok: false; state: ActionState } {
  const title = text(fd, "title");
  const prerequisites = text(fd, "prerequisites");
  const learningModel = text(fd, "learningModel");
  const objectives = lineList(text(fd, "objectives"));
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Judul/fokus pertemuan wajib diisi.";
  if (!prerequisites) errors.prerequisites = "Kompetensi awal wajib diisi.";
  if (!learningModel) errors.learningModel = "Model pembelajaran wajib diisi.";
  if (objectives.length === 0) errors.objectives = "Tuliskan minimal satu tujuan pembelajaran.";

  let steps: z.infer<typeof StepSchema>[] = [];
  try {
    const parsed = z.array(StepSchema).safeParse(JSON.parse(text(fd, "steps") || "[]"));
    if (!parsed.success) errors.steps = parsed.error.issues[0]?.message ?? "Langkah pembelajaran tidak valid.";
    else steps = parsed.data.map((s) => ({ ...s, details: s.details.filter(Boolean) }));
  } catch {
    errors.steps = "Langkah pembelajaran tidak valid.";
  }
  if (!errors.steps && steps.length === 0) errors.steps = "Tambahkan minimal satu langkah pembelajaran.";
  if (Object.keys(errors).length) return { ok: false, state: failure("Periksa kembali isian yang ditandai.", errors) };

  const unitRaw = text(fd, "unit");
  const unit = unitRaw ? Number(unitRaw) : null;
  const teachDate = text(fd, "teachDate");
  return {
    ok: true,
    data: {
      title,
      subject: text(fd, "subject") || "Bahasa Inggris",
      book: optional(fd, "book"),
      unit: unit && Number.isInteger(unit) && unit > 0 ? unit : null,
      unitTitle: optional(fd, "unitTitle"),
      meeting: Math.max(1, Math.min(20, Number(text(fd, "meeting")) || 1)),
      phase: text(fd, "phase") || "D",
      grade: Math.max(7, Math.min(9, Number(text(fd, "grade")) || 7)),
      semester: text(fd, "semester") || "I (Ganjil)",
      duration: text(fd, "duration") || "2 x 40 menit",
      schoolName: optional(fd, "schoolName"),
      authorName: optional(fd, "authorName"),
      year: optional(fd, "year"),
      prerequisites,
      profiles: JSON.stringify(fd.getAll("profiles").map(String).filter(Boolean)),
      resources: lineList(text(fd, "resources")).join("\n"),
      learningModel,
      approach: lineList(text(fd, "approach")).join("\n"),
      objectives: JSON.stringify(objectives),
      steps: JSON.stringify(steps),
      assessment: lineList(text(fd, "assessment")).join("\n") || null,
      reflectionStudent: lineList(text(fd, "reflectionStudent")).join("\n") || null,
      reflectionTeacher: lineList(text(fd, "reflectionTeacher")).join("\n") || null,
      attachments: lineList(text(fd, "attachments")).join("\n") || null,
      ...(copy ? { teachDate: teachDate ? new Date(`${teachDate}T00:00:00Z`) : null } : {}),
    },
  };
}

function revalidateRpp() {
  revalidatePath("/admin/rpp", "layout");
  revalidatePath("/guru/rpp", "layout");
  revalidatePath("/admin");
}

// ───────────── Admin: RPP induk ─────────────

export async function saveModulMaster(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = readContent(fd, false);
  if (!parsed.ok) return parsed.state;
  const id = text(fd, "id");
  const data = parsed.data;
  const published = fd.get("published") === "on";

  let savedId = id;
  if (id) {
    const existing = await db.modulAjar.findUnique({ where: { id }, select: { teacherId: true } });
    if (!existing || existing.teacherId) return failure("RPP induk tidak ditemukan.");
    await db.modulAjar.update({ where: { id }, data: { ...data, published } as never });
  } else {
    const created = await db.modulAjar.create({ data: { ...data, published } as never, select: { id: true } });
    savedId = created.id;
  }
  await logAudit("rpp.save", { actorId: admin.id, target: String(data.title), detail: id ? "Perbarui" : "Buat baru" });
  revalidateRpp();
  redirect(`/admin/rpp/${savedId}`);
}

export async function toggleModulPublish(fd: FormData) {
  const admin = await requireAdmin();
  const id = text(fd, "id");
  const m = await db.modulAjar.findUnique({ where: { id }, select: { teacherId: true, published: true, title: true } });
  if (!m || m.teacherId) return;
  await db.modulAjar.update({ where: { id }, data: { published: !m.published } });
  await logAudit("rpp.publish", { actorId: admin.id, target: m.title, detail: m.published ? "Ditarik (draf)" : "Diterbitkan" });
  revalidateRpp();
}

export async function deleteModulMaster(fd: FormData) {
  const admin = await requireAdmin();
  const id = text(fd, "id");
  const m = await db.modulAjar.findUnique({ where: { id }, select: { teacherId: true, title: true, unit: true, meeting: true } });
  if (!m || m.teacherId) return;
  // Salinan guru tetap tersimpan (sourceId otomatis dikosongkan).
  await db.modulAjar.delete({ where: { id } });
  await logAudit("rpp.delete", { actorId: admin.id, target: m.title, detail: m.unit ? `Unit ${m.unit} · P${m.meeting}` : null });
  revalidateRpp();
  redirect("/admin/rpp");
}

// ───────────── Guru: salinan pribadi ─────────────

/** Guru memakai RPP induk: dibuatkan salinan pribadi yang siap disesuaikan. */
export async function adoptModulAjar(fd: FormData) {
  const user = await requireTeacher();
  const source = await db.modulAjar.findUnique({ where: { id: text(fd, "id") } });
  if (!source || source.teacherId || !source.published) redirect("/guru/rpp");
  const profile = await getSchoolProfile();
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = source;
  void _id; void _ca; void _ua;
  const copy = await db.modulAjar.create({
    data: {
      ...rest,
      sourceId: source.id,
      teacherId: user.teacher.id,
      schoolName: profile.name || null,
      authorName: user.name,
      year: String(new Date().getFullYear()),
      published: true,
    },
    select: { id: true },
  });
  await logAudit("rpp.use", { actorId: user.id, target: source.title, detail: source.unit ? `Unit ${source.unit} · P${source.meeting}` : null });
  revalidateRpp();
  redirect(`/guru/rpp/modul/${copy.id}/edit`);
}

export async function saveModulCopy(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireTeacher();
  const id = text(fd, "id");
  const existing = await db.modulAjar.findUnique({ where: { id }, select: { teacherId: true, title: true } });
  if (!existing || existing.teacherId !== user.teacher.id) return failure("RPP tidak ditemukan atau bukan milik Anda.");
  const parsed = readContent(fd, true);
  if (!parsed.ok) return parsed.state;
  await db.modulAjar.update({
    where: { id },
    data: { ...parsed.data, className: optional(fd, "className"), teacherNotes: optional(fd, "teacherNotes") },
  });
  await logAudit("rpp.copy_save", { actorId: user.id, target: existing.title });
  revalidateRpp();
  redirect(`/guru/rpp/modul/${id}`);
}

export async function deleteModulCopy(fd: FormData) {
  const user = await requireTeacher();
  const id = text(fd, "id");
  const m = await db.modulAjar.findUnique({ where: { id }, select: { teacherId: true, title: true } });
  if (!m || m.teacherId !== user.teacher.id) return;
  await db.modulAjar.delete({ where: { id } });
  await logAudit("rpp.copy_delete", { actorId: user.id, target: m.title });
  revalidateRpp();
  redirect("/guru/rpp?tab=saya");
}

