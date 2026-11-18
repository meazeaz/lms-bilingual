import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { requireStudent } from "@/lib/auth";
import { getSchoolProfile } from "@/lib/settings-server";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { avatarSrc } from "@/lib/avatar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore, profile] = await Promise.all([
    requireStudent(),
    cookies(),
    getSchoolProfile(),
  ]);
  return (
    <AppShell
      role="STUDENT"
      name={user.name}
      subtitle={`Siswa kelas ${user.student.classRoom.name}`}
      logoUrl={profile.logoUrl}
      avatarUrl={avatarSrc(user.avatarFileId)}
      defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"}
    >
      {children}
    </AppShell>
  );
}
