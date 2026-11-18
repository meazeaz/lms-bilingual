import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/settings-server";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { avatarSrc } from "@/lib/avatar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore, profile, pendingLogs, pendingPhrases, pendingChallenges, pendingReflections] = await Promise.all([
    requireAdmin(),
    cookies(),
    getSchoolProfile(),
    db.dailyLog.count({ where: { status: "PENDING" } }),
    db.phraseMastery.count({ where: { status: "PENDING" } }),
    db.challengeProgress.count({ where: { status: "PENDING" } }),
    db.reflection.count({ where: { status: "PENDING" } }),
  ]);
  const totalPending = pendingLogs + pendingPhrases + pendingChallenges + pendingReflections;
  return (
    <AppShell
      role="ADMIN"
      name={user.name}
      subtitle={user.title ?? "Admin"}
      counts={{ verifikasi: totalPending }}
      logoUrl={profile.logoUrl}
      avatarUrl={avatarSrc(user.avatarFileId)}
      defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"}
    >
      {children}
    </AppShell>
  );
}
