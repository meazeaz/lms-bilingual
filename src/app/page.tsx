import { Landing } from "@/components/landing";
import { FULL_BILINGUAL_DATE } from "@/lib/program";

export const dynamic = "force-dynamic";

export default function Home() {
  const daysLeft = Math.max(0, Math.ceil((FULL_BILINGUAL_DATE.getTime() - Date.now()) / 86400000));
  return <Landing daysLeft={daysLeft} />;
}
