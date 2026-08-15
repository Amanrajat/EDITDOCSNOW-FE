import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Real output verification for the Office-format conversions, same
 * philosophy as verify-pdf.ts: shell out to the backend's own Python venv
 * (which already has python-docx/openpyxl/python-pptx installed as the
 * conversion libraries themselves) and re-open the generated file with
 * the real library, rather than just checking magic bytes.
 */

const BACKEND_ROOT = path.resolve(__dirname, "../../../EDITDOCSNOW-BE");
const BACKEND_PYTHON = path.join(BACKEND_ROOT, ".venv", "bin", "python");

function runPython(script: string, filePath: string) {
  const output = execFileSync(BACKEND_PYTHON, ["-c", script, filePath], { encoding: "utf-8" });
  return JSON.parse(output);
}

export function inspectDocx(filePath: string): { paragraphs: string[]; table_count: number } {
  const script = `
import sys, json
from docx import Document
d = Document(sys.argv[1])
print(json.dumps({
    "paragraphs": [p.text for p in d.paragraphs if p.text.strip()],
    "table_count": len(d.tables),
}))
`;
  return runPython(script, filePath);
}

export function inspectXlsx(filePath: string): { sheet_names: string[]; first_sheet_rows: unknown[][] } {
  const script = `
import sys, json
from openpyxl import load_workbook
wb = load_workbook(sys.argv[1])
first = wb[wb.sheetnames[0]]
rows = [[c.value for c in row] for row in first.iter_rows(min_row=1, max_row=5)]
print(json.dumps({"sheet_names": wb.sheetnames, "first_sheet_rows": rows}))
`;
  return runPython(script, filePath);
}

export function inspectPptx(filePath: string): { slide_count: number; slide_texts: string[][] } {
  const script = `
import sys, json
from pptx import Presentation
prs = Presentation(sys.argv[1])
slide_texts = []
for slide in prs.slides:
    texts = [s.text_frame.text for s in slide.shapes if s.has_text_frame and s.text_frame.text.strip()]
    slide_texts.append(texts)
print(json.dumps({"slide_count": len(prs.slides._sldIdLst), "slide_texts": slide_texts}))
`;
  return runPython(script, filePath);
}
