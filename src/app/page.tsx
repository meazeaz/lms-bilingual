import { Landing, type SearchEntry } from "@/components/landing";
import { FULL_BILINGUAL_DATE } from "@/lib/program";
import { SUBJECT_GLOSSARIES } from "@/lib/glossary";
import { getPublicStats } from "@/lib/public-stats";
import { getSchoolProfile } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const daysLeft = Math.max(0, Math.ceil((FULL_BILINGUAL_DATE.getTime() - Date.now()) / 86400000));
  const [stats, profile] = await Promise.all([getPublicStats(), getSchoolProfile()]);

  // Bahan pencarian: kalimat Pocket Book dari database + glosarium 4 mapel bilingual
  const searchEntries: SearchEntry[] = [
    ...stats.phrases.map((p) => ({ en: p.en, id: p.id, tag: p.category })),
    ...SUBJECT_GLOSSARIES.flatMap((g) => g.terms.map((t) => ({ en: t.term, id: t.translation, tag: g.label }))),
  ];

  return (
    <Landing
      daysLeft={daysLeft}
      stats={stats}
      searchEntries={searchEntries}
      school={{
        name: profile.name,
        logoUrl: profile.logoUrl || "/logo-almadany.png",
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        npsn: profile.npsn,
        accreditation: profile.accreditation,
      }}
    />
  );
}
