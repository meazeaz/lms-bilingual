import { AppShell } from "@/components/app-shell";
import { requireTeacher } from "@/lib/auth";
import { LEVEL_LABEL, type Level } from "@/lib/program";
import { getSchoolProfile } from "@/lib/settings-server";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([
    requireTeacher(),
    getSchoolProfile(),
  ]);
  return (
    <AppShell
      role="TEACHER"
      name={user.name}
      subtitle={`${user.teacher.subject} · ${LEVEL_LABEL[user.teacher.ambassadorLevel as Level]}`}
      logoUrl={profile.logoUrl}
    >
      {children}
    </AppShell>
  );
}
