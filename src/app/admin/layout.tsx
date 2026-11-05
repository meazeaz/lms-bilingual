import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/settings-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, profile, pendingLogs, pendingPhrases, pendingChallenges, pendingReflections, pendingPlans] = await Promise.all([
    requireAdmin(),
    getSchoolProfile(),
    db.dailyLog.count({ where: { status: "PENDING" } }),
    db.phraseMastery.count({ where: { status: "PENDING" } }),
    db.challengeProgress.count({ where: { status: "PENDING" } }),
    db.reflection.count({ where: { status: "PENDING" } }),
    db.lessonPlan.count({ where: { status: "DIAJUKAN" } }),
  ]);
  const totalPending = pendingLogs + pendingPhrases + pendingChallenges + pendingReflections + pendingPlans;
  return (
    <AppShell
      role="ADMIN"
      name={user.name}
      subtitle={user.title ?? "Admin"}
      counts={{ verifikasi: totalPending }}
      logoUrl={profile.logoUrl}
    >
      {children}
    </AppShell>
  );
}
