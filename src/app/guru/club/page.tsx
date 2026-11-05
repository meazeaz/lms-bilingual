import type { Metadata } from "next";
import { Calendar, CheckCircle2, MessagesSquare, Sparkles, Star, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ClubSessionList,
  type ClubSessionItem,
  type StudentLookupItem,
} from "./club-client";

export const metadata: Metadata = { title: "Madani English Club & Peer Tutoring · Guru" };

export default async function GuruClubPage() {
  await requireTeacher();

  const [rawSessions, rawStudents] = await Promise.all([
    db.clubSession.findMany({
      include: {
        leader: { include: { user: true } },
        attendances: {
          include: { student: { include: { user: true, classRoom: true } } },
        },
      },
      orderBy: { date: "desc" },
    }),
    db.student.findMany({
      include: { user: true, classRoom: true },
      orderBy: [{ classRoom: { name: "asc" } }, { user: { name: "asc" } }],
    }),
  ]);

  const sessions: ClubSessionItem[] = rawSessions.map((s) => ({
    id: s.id,
    type: s.type,
    date: s.date.toISOString(),
    topic: s.topic,
    activity: s.activity,
    notes: s.notes,
    leaderName: s.leader ? s.leader.user.name : null,
    attendances: s.attendances.map((a) => ({
      studentId: a.studentId,
      studentName: a.student.user.name,
      className: a.student.classRoom.name,
      role: a.role as "PESERTA" | "TUTOR",
      present: a.present,
    })),
  }));

  const students: StudentLookupItem[] = rawStudents.map((st) => ({
    id: st.id,
    name: st.user.name,
    className: st.classRoom.name,
    cefrLevel: st.cefrLevel,
    pareAlumni: st.pareAlumni,
    isStudentAmbassador: st.isStudentAmbassador,
  }));

  const totalSessions = sessions.length;
  const englishClubCount = sessions.filter((s) => s.type === "ENGLISH_CLUB").length;
  const peerTutoringCount = sessions.filter((s) => s.type === "PEER_TUTORING").length;
  const ambassadors = students.filter((s) => s.isStudentAmbassador).length;

  return (
    <>
      <PageHeader
        eyebrow="Ekosistem Praktik Siswa (Bab 7.1 & 7.2)"
        title="Madani English Club & Peer Tutoring"
        description="Fasilitasi ekstrakurikuler Sabtu pagi dan sesi bimbingan tutor sebaya Kamis sore untuk mengasah keberanian berbicara siswa."
      />

      {/* Ringkasan Metrik */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sesi Terlaksana"
          value={`${totalSessions} Sesi`}
          hint={`${englishClubCount} Club · ${peerTutoringCount} Peer Tutoring`}
          icon={Calendar}
          tone="brand"
        />
        <StatCard
          label="English Club (Sabtu)"
          value={`${englishClubCount} Sesi`}
          hint="Debat, drama, games & storytelling"
          icon={MessagesSquare}
          tone="mint"
        />
        <StatCard
          label="Peer Tutoring (Kamis)"
          value={`${peerTutoringCount} Sesi`}
          hint="Bimbingan sebaya bersama Alumni Pare"
          icon={Users}
          tone="gold"
        />
        <StatCard
          label="Student Ambassador"
          value={`${ambassadors} Siswa`}
          hint="Siswa tutor bersertifikasi"
          icon={Star}
          tone="gold"
        />
      </div>

      <ClubSessionList sessions={sessions} students={students} />
    </>
  );
}
