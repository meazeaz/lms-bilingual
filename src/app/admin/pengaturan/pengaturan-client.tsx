"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  ImageIcon,
  Layers,
  Link as LinkIcon,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  addSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
  resetSubjectsAction,
  addMaterialCategoryAction,
  updateMaterialCategoryAction,
  deleteMaterialCategoryAction,
  updateSchoolProfileAction,
  updateSchoolLogoAction,
} from "@/actions/settings";
import { ActionForm, SubmitButton } from "@/components/forms";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Pill,
  Select,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import type { MaterialCategory, SystemSettings } from "@/lib/settings";

type TabKey = "subjects" | "categories" | "school";

export function PengaturanClient({
  settings,
  stats,
}: {
  settings: SystemSettings;
  stats: {
    teacherSubjectCount: Record<string, number>;
    materialSubjectCount: Record<string, number>;
    materialCategoryCount: Record<string, number>;
  };
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("subjects");
  const [searchSubject, setSearchSubject] = useState("");
  const [openAddSubject, setOpenAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<string | null>(null);

  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MaterialCategory | null>(null);

  // State untuk pengelolaan logo sekolah
  const [logoMode, setLogoMode] = useState<"UPLOAD" | "URL">("UPLOAD");
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFilePreview(null);
      setSelectedFileName("");
    }
  };

  const filteredSubjects = settings.subjects.filter((s) =>
    s.toLowerCase().includes(searchSubject.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigasi */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === "subjects"
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <GraduationCap className="size-4" />
          <span>Mata Pelajaran ({settings.subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === "categories"
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="size-4" />
          <span>Kategori Materi ({settings.materialCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("school")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === "school"
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="size-4" />
          <span>Profil Sekolah & Semester</span>
        </button>
      </div>

      {/* ──────────────────── TAB 1: MATA PELAJARAN ──────────────────── */}
      {activeTab === "subjects" && (
        <div className="space-y-5">
          {/* Header Card Tindakan */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Cari mata pelajaran..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActionForm action={resetSubjectsAction}>
                <SubmitButton
                  variant="secondary"
                  size="sm"
                >
                  <RotateCcw className="size-3.5" />
                  Reset Standar
                </SubmitButton>
              </ActionForm>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setOpenAddSubject(true);
                  setEditingSubject(null);
                  setDeletingSubject(null);
                }}
              >
                <Plus className="size-4" />
                Tambah Mapel Baru
              </Button>
            </div>
          </div>

          {/* Form Tambah Mapel */}
          {openAddSubject && (
            <Card className="border-brand-200 bg-brand-50/30">
              <CardHeader
                icon={Plus}
                title="Tambah Mata Pelajaran Baru"
                description="Mata pelajaran ini otomatis muncul di seluruh dropdown RPP, Observasi, Materi, dan Profil Guru."
                action={
                  <button
                    onClick={() => setOpenAddSubject(false)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5">
                <ActionForm
                  action={addSubjectAction}
                  resetOnSuccess
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1">
                    <Field label="Nama Mata Pelajaran *">
                      <Input
                        name="name"
                        placeholder="Contoh: Coding & Robotika, Kewirausahaan, dsb."
                        required
                        autoFocus
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2">
                    <SubmitButton variant="primary">Simpan Mapel</SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenAddSubject(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Form Edit Mapel */}
          {editingSubject && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader
                icon={Pencil}
                title={`Edit Mata Pelajaran: ${editingSubject}`}
                description="Perubahan nama otomatis memperbarui profil guru, materi, dan RPP yang terkait."
                action={
                  <button
                    onClick={() => setEditingSubject(null)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5">
                <ActionForm
                  action={updateSubjectAction}
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <input type="hidden" name="oldName" value={editingSubject} />
                  <div className="flex-1">
                    <Field label="Nama Mata Pelajaran Baru *">
                      <Input
                        name="newName"
                        defaultValue={editingSubject}
                        required
                        autoFocus
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2">
                    <SubmitButton variant="primary">Simpan Perubahan</SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingSubject(null)}
                    >
                      Batal
                    </Button>
                  </div>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Konfirmasi Hapus Mapel */}
          {deletingSubject && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardHeader
                icon={Trash2}
                title={`Hapus Mata Pelajaran: ${deletingSubject}`}
                description="Konfirmasi penghapusan mata pelajaran dari daftar dropdown."
                action={
                  <button
                    onClick={() => setDeletingSubject(null)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5 space-y-3">
                <p className="text-sm text-slate-700">
                  Apakah Anda yakin ingin menghapus <strong>{deletingSubject}</strong> dari pilihan dropdown?
                </p>
                {(stats.teacherSubjectCount[deletingSubject] ?? 0) > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-100/70 p-3 text-xs text-amber-900">
                    ⚠️ Saat ini ada <strong>{stats.teacherSubjectCount[deletingSubject]} guru</strong> yang mengampu mata pelajaran ini. Menghapusnya dari dropdown tidak menghapus guru, namun opsi ini tidak akan muncul lagi di formulir baru.
                  </div>
                )}
                <ActionForm
                  action={deleteSubjectAction}
                  className="flex justify-end gap-2"
                >
                  <input type="hidden" name="name" value={deletingSubject} />
                  <SubmitButton variant="danger">Ya, Hapus Mapel</SubmitButton>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDeletingSubject(null)}
                  >
                    Batal
                  </Button>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Tabel Daftar Mata Pelajaran */}
          <Card>
            <CardHeader
              icon={SlidersHorizontal}
              title="Daftar Mata Pelajaran Aktif"
              description="Pilihan mata pelajaran yang digunakan di seluruh formulir LMS Bilingual SMPIT Al Madany."
            />
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th className="w-14 text-center">No</Th>
                    <Th>Mata Pelajaran</Th>
                    <Th className="text-center">Guru Terkait</Th>
                    <Th className="text-center">Materi Terbit</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((s, idx) => {
                    const teacherCount = stats.teacherSubjectCount[s] ?? 0;
                    const materialCount = stats.materialSubjectCount[s] ?? 0;
                    return (
                      <tr key={s} className="hover:bg-brand-50/30 transition">
                        <Td className="text-center font-bold text-slate-400">{idx + 1}</Td>
                        <Td className="font-bold text-ink">
                          <span className="inline-flex items-center gap-2">
                            <span>{s}</span>
                            {s === "Umum" && <Pill tone="info">Default</Pill>}
                          </span>
                        </Td>
                        <Td className="text-center">
                          {teacherCount > 0 ? (
                            <Pill tone="success">{teacherCount} Guru</Pill>
                          ) : (
                            <span className="text-xs text-slate-400">–</span>
                          )}
                        </Td>
                        <Td className="text-center">
                          {materialCount > 0 ? (
                            <Pill tone="info">{materialCount} Materi</Pill>
                          ) : (
                            <span className="text-xs text-slate-400">–</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingSubject(s);
                                setOpenAddSubject(false);
                                setDeletingSubject(null);
                              }}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            {s !== "Umum" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  setDeletingSubject(s);
                                  setEditingSubject(null);
                                  setOpenAddSubject(false);
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <Td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada mata pelajaran yang cocok dengan pencarian "{searchSubject}".
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ──────────────────── TAB 2: KATEGORI MATERI ──────────────────── */}
      {activeTab === "categories" && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Kategori materi menentukan klasifikasi bahan ajar bilingual yang dapat ditulis oleh guru dan dipelajari siswa.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setOpenAddCategory(true);
                setEditingCategory(null);
                setDeletingCategory(null);
              }}
            >
              <Plus className="size-4" />
              Tambah Kategori Baru
            </Button>
          </div>

          {/* Form Tambah Kategori */}
          {openAddCategory && (
            <Card className="border-brand-200 bg-brand-50/30">
              <CardHeader
                icon={Plus}
                title="Tambah Kategori Materi Baru"
                description="Tentukan kode ID singkat dan label tampilan bilingual (misal Indonesia & Inggris)."
                action={
                  <button
                    onClick={() => setOpenAddCategory(false)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5">
                <ActionForm
                  action={addMaterialCategoryAction}
                  resetOnSuccess
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Kode / ID Kategori *" hint="Contoh: Speaking, Idioms, STEM">
                      <Input name="id" placeholder="Misal: Speaking" required autoFocus />
                    </Field>
                    <Field label="Label Tampilan Dropdown *" hint="Contoh: Berbicara & Pengucapan (Speaking)">
                      <Input
                        name="label"
                        placeholder="Misal: Berbicara (Speaking & Pronunciation)"
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Deskripsi Singkat (Opsional)">
                    <Input
                      name="description"
                      placeholder="Penjelasan ringkas tentang materi yang masuk kategori ini..."
                    />
                  </Field>
                  <div className="flex justify-end gap-2 pt-2">
                    <SubmitButton variant="primary">Simpan Kategori</SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenAddCategory(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Form Edit Kategori */}
          {editingCategory && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader
                icon={Pencil}
                title={`Edit Kategori: ${editingCategory.id}`}
                description="Perbarui label tampilan bilingual atau status aktif kategori."
                action={
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5">
                <ActionForm
                  action={updateMaterialCategoryAction}
                  className="space-y-4"
                >
                  <input type="hidden" name="id" value={editingCategory.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Kode / ID Kategori">
                      <Input value={editingCategory.id} disabled className="bg-slate-100" />
                    </Field>
                    <Field label="Label Tampilan Dropdown *">
                      <Input
                        name="label"
                        defaultValue={editingCategory.label}
                        required
                        autoFocus
                      />
                    </Field>
                  </div>
                  <Field label="Deskripsi">
                    <Input
                      name="description"
                      defaultValue={editingCategory.description ?? ""}
                    />
                  </Field>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        value="true"
                        defaultChecked={editingCategory.active}
                        className="size-4 rounded accent-brand-500"
                      />
                      <span>Aktifkan kategori ini di dropdown materi</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <SubmitButton variant="primary">Simpan Perubahan</SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingCategory(null)}
                    >
                      Batal
                    </Button>
                  </div>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Konfirmasi Hapus Kategori */}
          {deletingCategory && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardHeader
                icon={Trash2}
                title={`Hapus Kategori: ${deletingCategory.label}`}
                description="Konfirmasi penghapusan kategori materi."
                action={
                  <button
                    onClick={() => setDeletingCategory(null)}
                    className="rounded-xl p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <X className="size-5" />
                  </button>
                }
              />
              <CardBody className="p-5 space-y-3">
                <p className="text-sm text-slate-700">
                  Apakah Anda yakin ingin menghapus kategori <strong>{deletingCategory.label}</strong>?
                </p>
                <ActionForm
                  action={deleteMaterialCategoryAction}
                  className="flex justify-end gap-2"
                >
                  <input type="hidden" name="id" value={deletingCategory.id} />
                  <SubmitButton variant="danger">Ya, Hapus Kategori</SubmitButton>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDeletingCategory(null)}
                  >
                    Batal
                  </Button>
                </ActionForm>
              </CardBody>
            </Card>
          )}

          {/* Tabel Kategori */}
          <Card>
            <CardHeader
              icon={BookOpen}
              title="Daftar Kategori Materi Pembelajaran"
              description="Pilihan kategori ini tampil di formulir Penulisan Materi Baru (Guru & Admin)."
            />
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Kode ID</Th>
                    <Th>Label Dropdown (Bilingual)</Th>
                    <Th>Deskripsi</Th>
                    <Th className="text-center">Materi Terkait</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {settings.materialCategories.map((c) => {
                    const count = stats.materialCategoryCount[c.id] ?? 0;
                    return (
                      <tr key={c.id} className="hover:bg-brand-50/30 transition">
                        <Td className="font-mono text-xs font-bold text-slate-600">
                          {c.id}
                        </Td>
                        <Td className="font-bold text-ink">
                          {c.label}
                        </Td>
                        <Td className="text-xs text-slate-500 max-w-xs truncate">
                          {c.description || "–"}
                        </Td>
                        <Td className="text-center">
                          {count > 0 ? (
                            <Pill tone="info">{count} Materi</Pill>
                          ) : (
                            <span className="text-xs text-slate-400">–</span>
                          )}
                        </Td>
                        <Td className="text-center">
                          {c.active ? (
                            <Pill tone="success">Aktif</Pill>
                          ) : (
                            <Pill tone="neutral">Nonaktif</Pill>
                          )}
                        </Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(c);
                                setOpenAddCategory(false);
                                setDeletingCategory(null);
                              }}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setDeletingCategory(c);
                                setEditingCategory(null);
                                setOpenAddCategory(false);
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ──────────────────── TAB 3: PROFIL SEKOLAH & SEMESTER ──────────────────── */}
      {activeTab === "school" && (
        <div className="space-y-6">
          {/* Live Preview Kop Surat Resmi */}
          <Card className="border-brand-200 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
            <CardHeader
              icon={Sparkles}
              title="Pratinjau Kop Surat Resmi Sekolah"
              description="Informasi di bawah ini otomatis digunakan di kop surat RPP, lembar observasi, dan cetak laporan bulanan EDT."
            />
            <CardBody className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.profile.logoUrl || "/logo-almadany.png"}
                      alt="Logo SMPIT Al Madany"
                      className="size-14 object-contain shrink-0"
                    />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {settings.profile.foundation}
                      </p>
                      <h2 className="text-xl font-black text-ink tracking-tight">
                        {settings.profile.name}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {settings.profile.accreditation} · NPSN: {settings.profile.npsn} · NSS: {settings.profile.nss}
                  </p>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    {settings.profile.address} · Telp: {settings.profile.phone} · Email: {settings.profile.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Pill tone="info">Semester Aktif: {settings.profile.currentSemester}</Pill>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengaturan Logo Resmi Sekolah */}
          <Card className="border-indigo-100">
            <CardHeader
              icon={ImageIcon}
              title="Pengaturan Logo Resmi Sekolah"
              description="Perbarui logo institusi yang muncul di seluruh sistem: kop surat dokumen resmi, naskah bank soal, dan header aplikasi."
            />
            <CardBody className="p-6 space-y-6">
              {/* Box Pratinjau Logo Aktif / Berkas Terpilih */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="size-24 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedFilePreview || settings.profile.logoUrl || "/logo-almadany.png"}
                    alt="Pratinjau Logo Sekolah"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      {selectedFilePreview ? "Pratinjau Berkas Baru (Belum Disimpan)" : "Logo Aktif Saat Ini"}
                    </span>
                    <Pill tone={settings.profile.logoUrl && settings.profile.logoUrl !== "/logo-almadany.png" ? "success" : "neutral"}>
                      {settings.profile.logoUrl && settings.profile.logoUrl !== "/logo-almadany.png" ? "Logo Kustom" : "Logo Bawaan"}
                    </Pill>
                  </div>
                  <p className="text-xs text-slate-500 break-all font-mono">
                    {selectedFilePreview ? selectedFileName : (settings.profile.logoUrl || "/logo-almadany.png")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Spesifikasi direkomendasikan: Gambar PNG latar transparan, JPG, WebP, atau SVG. Rasio persegi (1:1), ukuran file maksimal 3 MB.
                  </p>
                </div>
              </div>

              {/* Mode Pemilihan Metode Ganti Logo */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
                  <button
                    type="button"
                    onClick={() => setLogoMode("UPLOAD")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      logoMode === "UPLOAD"
                        ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Upload className="size-3.5" />
                    <span>Unggah Berkas Gambar (Laptop / HP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode("URL")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      logoMode === "URL"
                        ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <LinkIcon className="size-3.5" />
                    <span>Gunakan Tautan URL Gambar</span>
                  </button>
                </div>

                {/* Form Upload Berkas */}
                {logoMode === "UPLOAD" && (
                  <ActionForm action={updateSchoolLogoAction} className="space-y-4">
                    <input type="hidden" name="actionType" value="UPLOAD" />
                    <Field
                      label="Pilih Berkas Logo dari Komputer/HP *"
                      hint="Format didukung: PNG, JPG, JPEG, WEBP, SVG (Maksimal 3 MB)"
                    >
                      <input
                        type="file"
                        name="logoFile"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoFileChange}
                        required
                        className="block w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-2xl p-2 bg-white shadow-xs"
                      />
                    </Field>
                    {selectedFileName && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span>Berkas terpilih: <strong>{selectedFileName}</strong>. Klik tombol Simpan di bawah untuk menerapkan logo.</span>
                      </div>
                    )}
                    <div className="flex justify-end pt-1">
                      <SubmitButton variant="primary" size="md">
                        <Upload className="size-4" />
                        Unggah &amp; Terapkan Logo
                      </SubmitButton>
                    </div>
                  </ActionForm>
                )}

                {/* Form Tautan URL Gambar */}
                {logoMode === "URL" && (
                  <ActionForm action={updateSchoolLogoAction} className="space-y-4">
                    <input type="hidden" name="actionType" value="URL" />
                    <Field
                      label="Tautan URL Gambar Logo *"
                      hint="Masukkan tautan URL publik gambar logo (contoh: https://sekolah.sch.id/logo.png)"
                    >
                      <Input
                        name="logoUrl"
                        type="url"
                        defaultValue={settings.profile.logoUrl?.startsWith("http") ? settings.profile.logoUrl : ""}
                        placeholder="https://example.com/logo.png"
                        required
                      />
                    </Field>
                    <div className="flex justify-end pt-1">
                      <SubmitButton variant="primary" size="md">
                        <Check className="size-4" />
                        Simpan Tautan Logo
                      </SubmitButton>
                    </div>
                  </ActionForm>
                )}
              </div>

              {/* Reset ke Logo Bawaan */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-3xl">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Kembalikan ke Logo Bawaan Al Madany</h5>
                  <p className="text-[11px] text-slate-500">
                    Hapus logo kustom dan kembalikan ke logo standar resmi SMPIT Al Madany.
                  </p>
                </div>
                <ActionForm action={updateSchoolLogoAction}>
                  <input type="hidden" name="actionType" value="RESET" />
                  <SubmitButton variant="secondary" size="sm">
                    <RotateCcw className="size-3.5" />
                    Reset ke Logo Bawaan
                  </SubmitButton>
                </ActionForm>
              </div>
            </CardBody>
          </Card>

          {/* Form Pengaturan Profil */}
          <Card>
            <CardHeader
              icon={Building2}
              title="Formulir Identitas Sekolah & Semester"
              description="Ubah data profil resmi sekolah sewaktu-waktu tanpa perlu mengedit kode aplikasi."
            />
            <CardBody className="p-6">
              <ActionForm action={updateSchoolProfileAction} className="space-y-5">
                <input type="hidden" name="logoUrl" value={settings.profile.logoUrl || "/logo-almadany.png"} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama Resmi Sekolah *">
                    <Input
                      name="name"
                      defaultValue={settings.profile.name}
                      required
                    />
                  </Field>
                  <Field label="Nama Yayasan Penyelenggara *">
                    <Input
                      name="foundation"
                      defaultValue={settings.profile.foundation}
                      required
                    />
                  </Field>
                </div>

                <Field label="Alamat Lengkap Sekolah *" hint="Dicantumkan pada kop surat dan dokumen resmi">
                  <Textarea
                    name="address"
                    defaultValue={settings.profile.address}
                    required
                    className="min-h-20"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Nomor Telepon">
                    <Input
                      name="phone"
                      defaultValue={settings.profile.phone}
                    />
                  </Field>
                  <Field label="Email Resmi Sekolah">
                    <Input
                      name="email"
                      type="email"
                      defaultValue={settings.profile.email}
                    />
                  </Field>
                  <Field label="Status Akreditasi">
                    <Input
                      name="accreditation"
                      defaultValue={settings.profile.accreditation}
                      placeholder="Misal: Terakreditasi A"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="NPSN (Nomor Pokok Sekolah Nasional)">
                    <Input
                      name="npsn"
                      defaultValue={settings.profile.npsn}
                    />
                  </Field>
                  <Field label="NSS (Nomor Statistik Sekolah)">
                    <Input
                      name="nss"
                      defaultValue={settings.profile.nss}
                    />
                  </Field>
                </div>

                <div className="border-t border-slate-200/80 pt-5">
                  <h4 className="text-sm font-bold text-ink mb-3">Pengaturan Semester</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Semester Berjalan (Aktif)"
                      hint="Digunakan sebagai semester default pada rekap penilaian"
                    >
                      <Select
                        name="currentSemester"
                        defaultValue={settings.profile.currentSemester}
                      >
                        {settings.profile.semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      label="Daftar Pilihan Semester (Satu per baris)"
                      hint="Tambahkan tahun ajaran atau semester baru di baris berikutnya"
                    >
                      <Textarea
                        name="semesters"
                        defaultValue={settings.profile.semesters.join("\n")}
                        className="min-h-24 font-mono text-xs"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <SubmitButton variant="primary" size="lg">
                    <Check className="size-4" />
                    Simpan Profil & Semester
                  </SubmitButton>
                </div>
              </ActionForm>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
