"""
Mengubah RPP (Modul Ajar) Rise Up! Teens 1 dalam format .docx menjadi JSON untuk seed LMS.

Pemakaian:
  python scripts/import-modul-ajar.py "materi2/Rise Up! Teens - Student Book 1-CTM"
Hasil: prisma/data/modul-ajar-rise-up-1/unit-{U}-p{P}.json
Butuh: pip install python-docx
"""
import json
import re
import sys
from pathlib import Path

import docx

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prisma" / "data" / "modul-ajar-rise-up-1"
FOCUS_MEETING = {"vocabulary & language": 1, "listening & reading": 2, "speaking & writing": 3}

REFLECTION_STUDENT = [
    "Apa hal baru yang kamu pelajari hari ini?",
    "Bagian mana yang paling mudah dan paling sulit bagimu? Mengapa?",
    "Kalimat bahasa Inggris apa yang sudah bisa kamu ucapkan dengan percaya diri?",
    "Apa yang akan kamu lakukan untuk berlatih di rumah?",
]
REFLECTION_TEACHER = [
    "Apakah tujuan pembelajaran tercapai? Bukti apa yang menunjukkannya?",
    "Kegiatan mana yang paling efektif dan mana yang perlu diperbaiki?",
    "Berapa persen instruksi kelas yang disampaikan dalam bahasa Inggris?",
    "Peserta didik mana yang memerlukan pendampingan atau pengayaan?",
]
ASSESSMENT = {
    1: [
        "Asesmen formatif: pengamatan pelafalan saat drill kosakata (listen and repeat).",
        "Pemeriksaan jawaban latihan kosakata dan language practice di Student Book.",
        "Unjuk kerja lisan: peserta didik memakai kosakata & struktur baru dalam kalimat sendiri.",
    ],
    2: [
        "Asesmen formatif: ketepatan jawaban tugas listening (menomori/menjodohkan/melengkapi).",
        "Pertanyaan pemahaman bacaan (literal & inferensial) dan pembahasan bersama.",
        "Pengamatan partisipasi saat diskusi berpasangan/kelompok.",
    ],
    3: [
        "Asesmen formatif: unjuk kerja speaking berpasangan (kelancaran, ketepatan, keberanian).",
        "Produk tulisan sederhana sesuai model di Student Book (struktur & kosakata unit).",
        "Umpan balik teman sebaya dan guru terhadap hasil speaking/writing.",
    ],
}


def cell_paras(cell):
    return [p.text.strip() for p in cell.paragraphs if p.text.strip()]


def row_cells(row):
    seen, cells = set(), []
    for c in row.cells:
        if id(c._tc) in seen:
            continue
        seen.add(id(c._tc))
        cells.append(cell_paras(c))
    return cells


def section_after(rows, heading_pattern):
    """Isi baris tepat setelah baris judul yang cocok (gabungan semua sel)."""
    for i, r in enumerate(rows):
        text = " ".join(" ".join(c) for c in r)
        if re.search(heading_pattern, text, re.I) and i + 1 < len(rows):
            return [p for c in rows[i + 1] for p in c]
    return []


def parse(path: Path):
    d = docx.Document(str(path))
    unit = int(re.search(r"Unit (\d+)", path.parent.name).group(1))
    focus_raw = re.split(r"Unit \d+\s*-\s*", path.stem)[-1].strip()
    meeting = FOCUS_MEETING[focus_raw.lower()]
    header = [p.text.strip() for p in d.paragraphs if p.text.strip()]
    m = next((re.search(r"\(Unit \d+\s*[–-]\s*(.+)\)", h) for h in header if h.startswith("(Unit")), None)
    unit_title = m.group(1).strip() if m else ""

    t1 = [row_cells(r) for r in d.tables[0].rows]
    identity_values = next((r[-1] for r in t1 if len(r) >= 3 and any("Nama Sekolah" in x for x in r[0])), [])
    duration = next((v for v in identity_values if re.match(r"^\d+\s*x\s*\d+", v)), "2 x 40")
    if "menit" not in duration:
        duration = duration + " menit"

    steps = []
    for r in list(d.tables[1].rows)[2:]:
        c = row_cells(r)
        if len(c) < 4:
            continue
        _, seq, minutes, details = c[0], c[1], c[2], c[3]
        seq_text = " ".join(seq).strip()
        if not seq_text:
            continue
        mins = re.search(r"\d+", " ".join(minutes))
        tag = None
        if details and re.match(r"^\(.*\)$", details[0]):
            tag = details[0].strip("()").strip()
            details = details[1:]
        steps.append({"sequence": seq_text, "minutes": int(mins.group()) if mins else 0, "tag": tag, "details": details})

    t3 = [row_cells(r) for r in d.tables[2].rows]
    attachments = section_after(t3, r"LEMBAR KERJA PESERTA DIDIK")

    return {
        "book": "Rise Up! Teens 1",
        "unit": unit,
        "unitTitle": unit_title,
        "meeting": meeting,
        "title": focus_raw.replace("&", "&").title().replace("And", "&"),
        "subject": "Bahasa Inggris",
        "phase": "D",
        "grade": 7,
        "semester": "I (Ganjil)",
        "duration": duration,
        "year": "2026",
        "prerequisites": " ".join(section_after(t1, r"KOMPETENSI AWAL")),
        "profiles": section_after(t1, r"PROFIL PELAJAR PANCASILA"),
        "resources": section_after(t1, r"SARANA DAN PRASARANA"),
        "learningModel": " ".join(section_after(t1, r"MODEL PEMBELAJARAN")),
        "approach": section_after(t1, r"^F\.?\s*PENDEKATAN"),
        "objectives": section_after(t1, r"TUJUAN KEGIATAN PEMBELAJARAN"),
        "steps": steps,
        "assessment": ASSESSMENT[meeting],
        "reflectionStudent": REFLECTION_STUDENT,
        "reflectionTeacher": REFLECTION_TEACHER,
        "attachments": attachments,
    }


def main():
    src = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "materi2" / "Rise Up! Teens - Student Book 1-CTM")
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(src.glob("Unit */*.docx"))
    for f in files:
        data = parse(f)
        name = f"unit-{data['unit']:02d}-p{data['meeting']}.json"
        (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        total = sum(s["minutes"] for s in data["steps"])
        print(f"{name}: {data['unitTitle']} · {data['title']} · {len(data['steps'])} langkah · {total} menit · tujuan {len(data['objectives'])}")
    print(f"{len(files)} modul ajar ditulis ke {OUT}")


if __name__ == "__main__":
    main()
