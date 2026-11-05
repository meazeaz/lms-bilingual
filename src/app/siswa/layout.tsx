import { AppShell } from "@/components/app-shell";
import { requireStudent } from "@/lib/auth";
import { getSchoolProfile } from "@/lib/settings-server";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([
    requireStudent(),
    getSchoolProfile(),
  ]);
  return (
    <AppShell
      role="STUDENT"
      name={user.name}
      subtitle={`Siswa kelas ${user.student.classRoom.name}`}
      logoUrl={profile.logoUrl}
    >
      {children}
    </AppShell>
  );
}
