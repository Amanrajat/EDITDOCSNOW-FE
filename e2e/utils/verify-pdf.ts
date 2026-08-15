import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Real output verification for E2E tests: shells out to the backend's own
 * Python venv (which has PyMuPDF installed) to re-open a downloaded PDF and
 * report facts about it - page count, per-page rotation, per-page text.
 * This is deliberately NOT reimplemented in JS: the backend's test suite
 * already treats PyMuPDF reopening as the source of truth for "did this
 * actually happen", and E2E should verify against that same ground truth
 * rather than trusting a 200 response.
 */

const BACKEND_ROOT = path.resolve(__dirname, "../../../EDITDOCSNOW-BE");
const BACKEND_PYTHON = path.join(BACKEND_ROOT, ".venv", "bin", "python");

interface PdfFacts {
  page_count: number;
  rotations: number[];
  texts: string[];
  sizes: [number, number][];
  images: number[];
  drawings: number[];
}

export function inspectPdf(filePath: string): PdfFacts {
  const script = `
import sys, json
import fitz
doc = fitz.open(sys.argv[1])
print(json.dumps({
    "page_count": doc.page_count,
    "rotations": [p.rotation for p in doc],
    "texts": [p.get_text().strip() for p in doc],
    "sizes": [[round(p.rect.width, 1), round(p.rect.height, 1)] for p in doc],
    "images": [len(p.get_images()) for p in doc],
    "drawings": [len(p.get_drawings()) for p in doc],
}))
`;
  const output = execFileSync(BACKEND_PYTHON, ["-c", script, filePath], {
    encoding: "utf-8",
  });
  return JSON.parse(output);
}
