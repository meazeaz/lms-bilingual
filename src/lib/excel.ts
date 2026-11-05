import "server-only";
import ExcelJS from "exceljs";

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export type Column = { header: string; key: string; width?: number; note?: string };

/** Membuat sheet bergaya seragam: header berwarna, baris header dibekukan, filter otomatis. */
export function addStyledSheet(wb: ExcelJS.Workbook, name: string, columns: Column[], rows: Record<string, unknown>[]) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? Math.max(12, c.header.length + 4) }));
  const header = ws.getRow(1);
  header.height = 22;
  header.eachCell((cell, i) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF5048E5" } };
    cell.alignment = { vertical: "middle" };
    const note = columns[i - 1]?.note;
    if (note) cell.note = note;
  });
  for (const r of rows) ws.addRow(r);
  if (rows.length > 0) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return ws;
}

/** Workbook baru dengan metadata sekolah. */
export function newWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "LMS Bilingual 2028 · SMPIT Al Madany";
  wb.created = new Date();
  return wb;
}

/** Mengirim workbook sebagai unduhan .xlsx. */
export async function xlsxResponse(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": XLSX_MIME,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Normalisasi judul kolom agar impor toleran terhadap huruf besar/kecil, tanda bintang, dan spasi. */
export function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/\*/g, "").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
}

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "object") {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if ("text" in v && typeof v.text === "string") return v.text; // hyperlink (mis. email)
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return v.result == null ? "" : String(v.result); // formula
    return "";
  }
  return String(v);
}

/**
 * Membaca sheet pertama menjadi array objek { judulKolomTernormalisasi: teks }.
 * Baris kosong dilewati; nomor baris Excel asli disertakan untuk pesan galat.
 */
export async function readSheetRows(data: ArrayBuffer): Promise<{ row: number; values: Record<string, string> }[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data);
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const headers: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col] = normalizeHeader(cellText(cell.value));
  });
  const out: { row: number; values: Record<string, string> }[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const values: Record<string, string> = {};
    let filled = false;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const key = headers[col];
      if (!key) return;
      const text = cellText(cell.value).trim();
      if (text) filled = true;
      values[key] = text;
    });
    if (filled) out.push({ row: rowNumber, values });
  });
  return out;
}

/** "Ya"/"Y"/"1"/"true" → true. */
export const isYes = (v: string | undefined) => /^(ya|y|yes|1|true|benar)$/i.test((v ?? "").trim());

/** Tanggal untuk nama berkas, mis. 2026-11-06. */
export const fileDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
