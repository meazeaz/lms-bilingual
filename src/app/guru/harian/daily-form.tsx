"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { saveDailyLog } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Checkbox, Field, Input, Textarea } from "@/components/ui";

type Initial = {
  mirrorMorning: boolean; voiceNoteOnTime: boolean; dailyMission: boolean; missionAnswer: string;
  englishZoneMinutes: number; buddySession: boolean; buddyNote: string; englishInClassPct: number;
};

export function DailyLogForm({ today, mission, initial }: { today: string; mission: string; initial?: Initial }) {
  const [pctValue, setPct] = useState(initial?.englishInClassPct ?? 30);
  const [missionOn, setMissionOn] = useState(initial?.dailyMission ?? false);
  return (
    <ActionForm action={saveDailyLog}>
      <input type="hidden" name="date" value={today} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox name="mirrorMorning" defaultChecked={initial?.mirrorMorning} label="Mirror Morning" description="Latihan di depan cermin & kirim voice note (maks. 30 detik)" />
        <Checkbox name="voiceNoteOnTime" defaultChecked={initial?.voiceNoteOnTime} label="Dikirim sebelum 06.15" description="Bonus poin tepat waktu (lencana Early Bird)" />
        <Checkbox name="dailyMission" defaultChecked={initial?.dailyMission} onChange={(e) => setMissionOn(e.target.checked)} label="Misi Harian" description={`Fokus minggu ini: ${mission}. Deadline 20.00`} />
        <Checkbox name="buddySession" defaultChecked={initial?.buddySession} label="Sesi English Buddy" description="2x seminggu @30 menit dengan pasangan B1+" />
      </div>
      {missionOn && (
        <Field label="Jawaban Misi Harian (bahasa Inggris)">
          <Textarea name="missionAnswer" defaultValue={initial?.missionAnswer} placeholder="Good morning, everyone! I hope you had a great weekend…" />
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="English Zone hari ini (menit)" hint="1 sesi = 30 menit di ruang guru / koridor / area sekolah">
          <Input type="number" name="englishZoneMinutes" min={0} max={300} step={15} defaultValue={initial?.englishZoneMinutes ?? 0} />
        </Field>
        <Field label={`Estimasi % bahasa Inggris di kelas: ${pctValue}%`} hint="Bronze 30% · Silver 50% · Gold 70% · Mentor 85%">
          <input type="range" name="englishInClassPct" min={0} max={100} step={5} value={pctValue} onChange={(e) => setPct(Number(e.target.value))} className="mt-3 w-full accent-brand-500" />
        </Field>
      </div>
      <Field label="Catatan buddy (opsional)"><Input name="buddyNote" defaultValue={initial?.buddyNote} placeholder="mis. Latihan 6 instruksi inti bersama Pak Yazid" /></Field>
      <SubmitButton variant="coral" size="lg"><Send className="size-4" /> Kirim laporan</SubmitButton>
    </ActionForm>
  );
}
