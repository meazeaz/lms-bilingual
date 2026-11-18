import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { requireTeacher } from "@/lib/auth";
import { LEVEL_LABEL, type Level } from "@/lib/program";
import { getSchoolProfile } from "@/lib/settings-server";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { avatarSrc } from "@/lib/avatar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore, profile] = await Promise.all([
    requireTeacher(),
    cookies(),
    getSchoolProfile(),
  ]);
  return (
    <AppShell
      role="TEACHER"
      name={user.name}
      subtitle={`${user.teacher.subject} · ${LEVEL_LABEL[user.teacher.ambassadorLevel as Level]}`}
      logoUrl={profile.logoUrl}
      avatarUrl={avatarSrc(user.avatarFileId)}
      defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"}
    >
      {children}
    </AppShell>
  );
}
