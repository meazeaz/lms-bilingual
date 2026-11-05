"use client";

import { useState } from "react";
import { Megaphone, Plus, Trash2, Users, X } from "lucide-react";
import { deleteAnnouncement, saveAnnouncement } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, CardHeader, Checkbox, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: string;
  isPublic: boolean;
  createdAt: Date;
  author: {
    name: string;
    role: string;
  };
}

export function PengumumanClient({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  const [openNew, setOpenNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-black text-ink">
            Daftar Broadcast Pengumuman ({announcements.length})
          </h3>
          <p className="text-xs text-slate-500">
            Pengumuman akan muncul di beranda dashboard guru, siswa, atau seluruh pengguna sesuai target audiens.
          </p>
        </div>

        <Button
          variant={openNew ? "secondary" : "primary"}
          size="sm"
          onClick={() => setOpenNew(!openNew)}
        >
          {openNew ? <><X className="size-4" /> Batal</> : <><Plus className="size-4" /> Tulis Pengumuman Baru</>}
        </Button>
      </div>

      {openNew && (
        <Card className="border-brand-200 bg-brand-50/20 shadow-md">
          <CardHeader
            icon={Megaphone}
            title="Buat Pengumuman Baru"
            description="Tulis pesan penting terkait agenda akselerasi bilingual untuk warga sekolah."
          />
          <CardBody className="p-5">
            <ActionForm action={saveAnnouncement} className="space-y-4">
              <Field label="Judul Pengumuman *" hint="Gunakan judul yang ringkas dan jelas">
                <Input
                  name="title"
                  placeholder="Mis. Sosialisasi English Club Semester Ganjil 2026/2027"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Target Sasaran Audiens *" hint="Pilih siapa yang dapat membaca pengumuman ini">
                  <Select name="audience" defaultValue="ALL">
                    <option value="ALL">Semua Warga Sekolah (Guru, Siswa, Admin)</option>
                    <option value="TEACHER">Khusus Dewan Guru (Duta & Pendidik)</option>
                    <option value="STUDENT">Khusus Seluruh Siswa SMP IT Al Madany</option>
                  </Select>
                </Field>
              </div>

              <Field label="Isi Pesan / Informasi Pengumuman *">
                <Textarea
                  name="body"
                  rows={4}
                  placeholder="Tuliskan detail jadwal, tempat, atau instruksi pelaksanaan program..."
                  required
                />
              </Field>

              <Checkbox
                name="isPublic"
                label="Tampilkan juga di halaman depan (publik)"
                description="Hanya berlaku untuk audiens Semua Warga Sekolah. Dapat dibaca siapa saja tanpa login, jadi jangan cantumkan data pribadi."
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                <Button type="button" variant="ghost" onClick={() => setOpenNew(false)}>
                  Batal
                </Button>
                <SubmitButton>Terbitkan Pengumuman</SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      )}

      {/* Daftar Pengumuman Aktif */}
      <Card>
        <CardBody className="p-0">
          {announcements.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada pengumuman yang diterbitkan. Klik tombol &ldquo;Tulis Pengumuman Baru&rdquo; di atas.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((a) => {
                const isAll = a.audience === "ALL";
                const isTeacher = a.audience === "TEACHER";
                return (
                  <div key={a.id} className="p-5 transition hover:bg-slate-50/50 flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={isAll ? "info" : isTeacher ? "warning" : "success"}>
                          {isAll ? "Semua Audiens" : isTeacher ? "Khusus Guru" : "Khusus Siswa"}
                        </Pill>
                        {a.isPublic && <Pill tone="coral">Tampil di halaman depan</Pill>}
                        <span className="text-xs text-slate-400">
                          {formatDate(a.createdAt)} · Diterbitkan oleh {a.author.name}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-ink">{a.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{a.body}</p>
                    </div>

                    <form action={deleteAnnouncement}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        title="Hapus Pengumuman"
                        onClick={(e) => {
                          if (!confirm(`Hapus pengumuman "${a.title}"?`)) {
                            e.preventDefault();
                          }
                        }}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
