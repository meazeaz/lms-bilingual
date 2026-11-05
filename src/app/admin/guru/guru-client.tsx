"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";

export function ExportTeachersButton({
  teachers,
}: {
  teachers: {
    name: string;
    nip: string | null;
    email: string;
    subject: string;
    level: string;
    isPilot: boolean;
    cefr: string;
    toefl: number | null;
  }[];
}) {
  function handleExport() {
    const header = ["Nama Guru", "NIP", "Email", "Mata Pelajaran", "Level Duta", "Status Pilot", "CEFR", "Skor TOEFL"];
    const rows = teachers.map((t) => [
      `"${t.name.replace(/"/g, '""')}"`,
      `"${(t.nip || "-").replace(/"/g, '""')}"`,
      `"${t.email}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${t.level}"`,
      t.isPilot ? '"Pilot"' : '"Reguler"',
      `"${t.cefr}"`,
      t.toefl ?? "-",
    ]);

    const csvContent = "\uFEFF" + [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data-guru-duta-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="size-4" /> Ekspor CSV Data Guru
    </Button>
  );
}

