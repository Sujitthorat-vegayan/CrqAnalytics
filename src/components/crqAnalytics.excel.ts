// ─── Excel download helper (uses SheetJS — npm install xlsx) ─────────────────
import * as XLSX from "xlsx";
import type { CRQTableRow } from "./crqAnalytics.api";

interface PopupColConfig {
  label: string;
  getValue: (row: CRQTableRow, index: number) => string;
}

export function downloadChartTableAsExcel(
  rows: CRQTableRow[],
  title: string,
  extraCol: PopupColConfig,
) {
  // Build flat row objects matching table column order
  const sheetData = rows.map((row, idx) => ({
    "Change ID":    row.changeId,
    "Submit Date":  row.submitDate,
    "Status":       row.status,
    "Aging":        row.aging,
    "Impact":       row.impact,
    "Requester":    row.requester,
    [extraCol.label]: extraCol.getValue(row, idx),
    "Summary":      row.summary,
    "Region":       row.region,
    "Circle":       row.circle,
    "Bin Group":    row.binGroup,
    "Coordinator":  row.coordinator,
    "Implementor":  row.implementor,
  }));

  const worksheet  = XLSX.utils.json_to_sheet(sheetData);
  const workbook   = XLSX.utils.book_new();

  // Auto column widths based on max content length
  const colWidths = Object.keys(sheetData[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...sheetData.map((r) => String(r[key as keyof typeof r] ?? "").length),
    ) + 2,
  }));
  worksheet["!cols"] = colWidths;

  // Tab name — strip " — Ticket Aging Distribution" suffix if present
  const tabName = title.replace(/\s*—.*$/, "").slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, tabName);

  // Filename: sanitise title, append timestamp
  const ts       = new Date().toISOString().slice(0, 10);
  const safeName = tabName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim().replace(/\s+/g, "_");
  XLSX.writeFile(workbook, `${safeName}_${ts}.xlsx`);
}