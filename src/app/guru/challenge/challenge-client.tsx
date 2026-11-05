"use client";

import { useState } from "react";
import { Check, Clock, FileText, Send, Sparkles, Target, X } from "lucide-react";
import { submitChallengeProgress } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, Field, Pill, StatusPill, Textarea } from "@/components/ui";

export function ChallengeSubmissionItem({
  challenge,
  progress,
}: {
  challenge: {
    id: string;
    week: number;
    title: string;
    description: string;
    target: string;
    points: number;
  };
  progress?: {
    id: string;
    evidence: string;
    status: string;
    createdAt: Date;
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const isApproved = progress?.status === "APPROVED";
  const isPending = progress?.status === "PENDING";
  const isRejected = progress?.status === "REJECTED";

  return (
    <Card className={`overflow-hidden transition hover:shadow-md ${
      isApproved
        ? "border-mint-200 bg-mint-50/20"
        : isPending
        ? "border-amber-200 bg-amber-50/20"
        : "border-slate-200 bg-white"
    }`}>
      <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center rounded-xl bg-brand-100 px-2.5 py-1 text-xs font-black text-brand-700">
              Minggu {challenge.week}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">
                +{challenge.points} Poin
              </span>
              {isApproved ? (
                <Pill tone="success">Selesai</Pill>
              ) : isPending ? (
                <Pill tone="warning">Menunggu EDT</Pill>
              ) : isRejected ? (
                <Pill tone="danger">Perlu Revisi</Pill>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Tersedia</span>
              )}
            </div>
          </div>

          <h4 className="text-base font-bold text-ink">
            {challenge.title}
          </h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {challenge.description}
          </p>

          <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block">Target Aksi:</span>
            <span className="text-slate-600">{challenge.target}</span>
          </div>

          {progress && (
            <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                Bukti Penerapan Dikirim ({new Date(progress.createdAt).toLocaleDateString("id-ID")}):
              </span>
              <p className="text-slate-700 italic">"{progress.evidence}"</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3">
          {isApproved ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-mint-700">
              <Check className="size-4" /> Tantangan Berhasil Diselesaikan
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                <Clock className="size-3.5" /> Menunggu review admin
              </span>
              <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
                {open ? "Tutup" : "Perbarui Bukti"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isRejected ? "Silakan perbaiki bukti aksi" : "Belum mengirimkan laporan"}
              </span>
              <Button variant="primary" size="sm" onClick={() => setOpen(!open)}>
                <Send className="size-3.5" /> {open ? "Batal" : isRejected ? "Kirim Ulang Bukti" : "Lapor Selesai"}
              </Button>
            </div>
          )}

          {open && !isApproved && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <ActionForm action={submitChallengeProgress} resetOnSuccess>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <Field label="Deskripsi Bukti Pelaksanaan & Dokumentasi Singkat">
                  <Textarea
                    id="evidence"
                    name="evidence"
                    rows={3}
                    required
                    defaultValue={progress?.evidence || ""}
                    placeholder="Contoh: Mengawali kelas 8A dengan 3 instruksi pembuka bahasa Inggris, membagikan lembar kerja, dan siswa merespon 'Good morning Miss'..."
                  />
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <SubmitButton variant="primary" size="sm" pendingText="Mengirim bukti…">
                    <Send className="size-3.5" /> Kirim Bukti Tantangan
                  </SubmitButton>
                </div>
              </ActionForm>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
