"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useUpload } from "@/hooks/useUpload";
import { useUIStore } from "@/store/ui.store";

export function UploadClient() {
  const { upload, isUploading, progress } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const recentDocuments = useUIStore((state) => state.recentDocuments);

  function handleFileSelected(file: File) {
    setSelectedFile(file);
    upload(file);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Upload your PDF
        </h1>
        <p className="mt-3 text-white/55">
          We&apos;ll extract every editable text block automatically — this usually takes a few seconds.
        </p>
      </div>

      <div className="mt-10">
        <UploadDropzone
          onFileSelected={handleFileSelected}
          isUploading={isUploading}
          progress={progress}
          selectedFile={selectedFile}
        />
      </div>

      {recentDocuments.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            Recent documents
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentDocuments.map((doc) => (
              <Link key={doc.id} href={`/editor/${doc.id}`} className="focus-ring-accent rounded-2xl">
                <Card
                  variant="default"
                  padding={4}
                  className="flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-400">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {doc.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" /> {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="neutral" label={`${doc.totalPages}p`} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
