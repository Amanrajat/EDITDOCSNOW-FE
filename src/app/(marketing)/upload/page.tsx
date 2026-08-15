import type { Metadata } from "next";
import { UploadClient } from "./UploadClient";

export const metadata: Metadata = {
  title: "Upload a PDF",
  description: "Upload a PDF to start editing its text, images, shapes, and annotations in the Advanced PDF Editor.",
  alternates: { canonical: "/upload" },
};

export default function UploadPage() {
  return <UploadClient />;
}
