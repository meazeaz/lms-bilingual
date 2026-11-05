"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { type ActionState, failure, success } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DEFAULT_SUBJECTS,
  DEFAULT_MATERIAL_CATEGORIES,
} from "@/lib/settings";
import {
  getSystemSettings,
  saveSystemSettings,
} from "@/lib/settings-server";

function revalidateAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
  revalidatePath("/siswa", "layout");
  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/asesmen");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/materi");
  revalidatePath("/admin/observasi");
  revalidatePath("/guru/materi");
  revalidatePath("/guru/rpp");
  revalidatePath("/guru/refleksi");
}

// ────────────────────── MATA PELAJARAN ──────────────────────

export async function addSubjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return failure("Nama mata pelajaran tidak boleh kosong.");
  }

  const settings = await getSystemSettings();
  const exists = settings.subjects.some(
    (s) => s.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    return failure(`Mata pelajaran "${name}" sudah terdaftar.`);
  }

  settings.subjects.push(name);
  await saveSystemSettings(settings);
  revalidateAll();

  return success(`Mata pelajaran "${name}" berhasil ditambahkan.`);
}

export async function updateSubjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const oldName = String(formData.get("oldName") || "").trim();
  const newName = String(formData.get("newName") || "").trim();

  if (!oldName || !newName) {
    return failure("Nama mata pelajaran lama dan baru wajib diisi.");
  }

  const settings = await getSystemSettings();
  const index = settings.subjects.indexOf(oldName);

  if (index === -1) {
    return failure(`Mata pelajaran "${oldName}" tidak ditemukan.`);
  }

  // Jika nama berubah, pastikan tidak duplikat
  if (oldName.toLowerCase() !== newName.toLowerCase()) {
    const exists = settings.subjects.some(
      (s) => s.toLowerCase() === newName.toLowerCase()
    );
    if (exists) {
      return failure(`Mata pelajaran "${newName}" sudah ada.`);
    }
  }

  settings.subjects[index] = newName;
  await saveSystemSettings(settings);

  // Perbarui relasi di database jika nama berubah
  if (oldName !== newName) {
    await Promise.allSettled([
      db.teacher.updateMany({ where: { subject: oldName }, data: { subject: newName } }),
      db.material.updateMany({ where: { subject: oldName }, data: { subject: newName } }),
      db.lessonPlan.updateMany({ where: { subject: oldName }, data: { subject: newName } }),
      db.observation.updateMany({ where: { subject: oldName }, data: { subject: newName } }),
      db.reflection.updateMany({ where: { subject: oldName }, data: { subject: newName } }),
    ]);
  }

  revalidateAll();
  return success(`Mata pelajaran berhasil diubah menjadi "${newName}".`);
}

export async function deleteSubjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return failure("Nama mata pelajaran tidak valid.");
  }

  const settings = await getSystemSettings();
  settings.subjects = settings.subjects.filter((s) => s !== name);

  if (settings.subjects.length === 0) {
    settings.subjects = ["Umum"];
  }

  await saveSystemSettings(settings);
  revalidateAll();

  return success(`Mata pelajaran "${name}" telah dihapus dari daftar.`);
}

export async function resetSubjectsAction(): Promise<ActionState> {
  await requireAdmin();
  const settings = await getSystemSettings();
  settings.subjects = [...DEFAULT_SUBJECTS];
  await saveSystemSettings(settings);
  revalidateAll();

  return success("Daftar mata pelajaran telah direset ke standar sekolah.");
}

// ────────────────────── KATEGORI MATERI ──────────────────────

export async function addMaterialCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!id || !label) {
    return failure("Kode ID dan Label Tampilan kategori wajib diisi.");
  }

  const settings = await getSystemSettings();
  const exists = settings.materialCategories.some(
    (c) => c.id.toLowerCase() === id.toLowerCase()
  );

  if (exists) {
    return failure(`Kategori dengan kode "${id}" sudah terdaftar.`);
  }

  settings.materialCategories.push({
    id,
    label,
    description: description || undefined,
    active: true,
  });

  await saveSystemSettings(settings);
  revalidateAll();

  return success(`Kategori materi "${label}" berhasil ditambahkan.`);
}

export async function updateMaterialCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const active = formData.get("active") === "true" || formData.get("active") === "on";

  if (!id || !label) {
    return failure("Kode ID dan Label kategori wajib diisi.");
  }

  const settings = await getSystemSettings();
  const cat = settings.materialCategories.find((c) => c.id === id);

  if (!cat) {
    return failure(`Kategori "${id}" tidak ditemukan.`);
  }

  cat.label = label;
  cat.description = description || undefined;
  cat.active = active;

  await saveSystemSettings(settings);
  revalidateAll();

  return success(`Kategori "${label}" berhasil diperbarui.`);
}

export async function deleteMaterialCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return failure("ID kategori tidak valid.");
  }

  const settings = await getSystemSettings();
  settings.materialCategories = settings.materialCategories.filter((c) => c.id !== id);

  if (settings.materialCategories.length === 0) {
    settings.materialCategories = [...DEFAULT_MATERIAL_CATEGORIES];
  }

  await saveSystemSettings(settings);
  revalidateAll();

  return success("Kategori materi berhasil dihapus.");
}

// ────────────────────── PROFIL SEKOLAH & SEMESTER ──────────────────────

export async function updateSchoolLogoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const actionType = String(formData.get("actionType") || "UPLOAD").trim();
  const settings = await getSystemSettings();

  if (actionType === "RESET") {
    settings.profile.logoUrl = "/logo-almadany.png";
    await saveSystemSettings(settings);
    revalidateAll();
    return success("Logo resmi sekolah berhasil di-reset ke logo bawaan SMPIT Al Madany.");
  }

  if (actionType === "URL") {
    const url = String(formData.get("logoUrl") || "").trim();
    if (!url) {
      return failure("Masukkan tautan URL logo yang valid.");
    }
    settings.profile.logoUrl = url;
    await saveSystemSettings(settings);
    revalidateAll();
    return success("Tautan logo resmi sekolah berhasil diperbarui.");
  }

  // Upload file dari komputer
  const file = formData.get("logoFile") as File | null;
  if (!file || file.size === 0) {
    return failure("Pilih berkas gambar logo terlebih dahulu.");
  }

  if (file.size > 3 * 1024 * 1024) {
    return failure("Ukuran berkas logo maksimal 3 MB.");
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];
  if (!allowedTypes.includes(file.type)) {
    return failure(
      "Format berkas tidak didukung. Harap gunakan berkas PNG, JPG, WebP, atau SVG."
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext) ? ext : "png";
  const fileName = `custom-school-logo.${safeExt}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filePath, buffer);

  // Simpan path dengan timestamp query string untuk mencegah cache browser usang
  settings.profile.logoUrl = `/uploads/${fileName}?v=${Date.now()}`;
  await saveSystemSettings(settings);
  revalidateAll();

  return success("Logo resmi sekolah berhasil diunggah dan diterapkan.");
}

export async function updateSchoolProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const foundation = String(formData.get("foundation") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const npsn = String(formData.get("npsn") || "").trim();
  const nss = String(formData.get("nss") || "").trim();
  const accreditation = String(formData.get("accreditation") || "").trim();
  const currentSemester = String(formData.get("currentSemester") || "").trim();
  const semestersRaw = String(formData.get("semesters") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();

  if (!name || !address) {
    return failure("Nama sekolah dan alamat resmi wajib diisi.");
  }

  const semesters = semestersRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const settings = await getSystemSettings();
  settings.profile = {
    name,
    foundation: foundation || settings.profile.foundation,
    address,
    phone: phone || settings.profile.phone,
    email: email || settings.profile.email,
    npsn: npsn || settings.profile.npsn,
    nss: nss || settings.profile.nss,
    accreditation: accreditation || settings.profile.accreditation,
    currentSemester: currentSemester || settings.profile.currentSemester,
    semesters: semesters.length > 0 ? semesters : settings.profile.semesters,
    logoUrl: logoUrl || settings.profile.logoUrl || "/logo-almadany.png",
  };

  await saveSystemSettings(settings);
  revalidateAll();

  return success("Profil sekolah dan semester berhasil disimpan.");
}
