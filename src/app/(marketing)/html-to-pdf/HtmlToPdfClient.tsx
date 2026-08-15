"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Globe } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useHtmlToPdf } from "@/hooks/useHtmlToPdf";
import { useDownloadActions } from "@/hooks/useDownloadActions";

type InputMode = "url" | "html";
type PageSize = "A4" | "Letter";
type Orientation = "portrait" | "landscape";

export function HtmlToPdfClient() {
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  const { convert, result, isConverting, isSuccess, error, reset } = useHtmlToPdf();

  function startOver() {
    setUrl("");
    setHtml("");
    reset();
  }

  const canSubmit = (mode === "url" ? url.trim().length > 0 : html.trim().length > 0) && !isConverting;

  function submit() {
    convert({
      url: mode === "url" ? url.trim() : undefined,
      html: mode === "html" ? html : undefined,
      pageSize,
      orientation,
    });
  }

  if (isSuccess && result) {
    return <HtmlToPdfSuccess downloadUrl={result.download_url} onStartOver={startOver} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
        <Globe className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">HTML to PDF</h1>
      <p className="mt-2 text-center text-white/55">
        Convert a webpage URL or raw HTML into a PDF.
      </p>

      <div className="mt-8 w-full">
        {error && (
          <div className="mb-4">
            <ErrorCard message={error.message} onRetry={() => reset()} onSecondaryAction={startOver} />
          </div>
        )}

        <div className="glass-card flex flex-col gap-5 rounded-xl border border-border p-5">
          <SegmentedControl label="Input type" value={mode} onChange={(v) => setMode(v as InputMode)}>
            <SegmentedControlItem value="url" label="Webpage URL" />
            <SegmentedControlItem value="html" label="Raw HTML" />
          </SegmentedControl>

          {mode === "url" ? (
            <TextInput
              label="URL"
              value={url}
              onChange={setUrl}
              placeholder="https://example.com"
              description="Public URLs only - internal/private network addresses are blocked."
            />
          ) : (
            <TextArea
              label="HTML"
              value={html}
              onChange={setHtml}
              placeholder="<h1>Hello</h1><p>Your content here…</p>"
              rows={10}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <SegmentedControl label="Page size" value={pageSize} onChange={(v) => setPageSize(v as PageSize)}>
              <SegmentedControlItem value="A4" label="A4" />
              <SegmentedControlItem value="Letter" label="Letter" />
            </SegmentedControl>
            <SegmentedControl label="Orientation" value={orientation} onChange={(v) => setOrientation(v as Orientation)}>
              <SegmentedControlItem value="portrait" label="Portrait" />
              <SegmentedControlItem value="landscape" label="Landscape" />
            </SegmentedControl>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            label={isConverting ? "Converting…" : "Convert to PDF"}
            variant="primary"
            isDisabled={!canSubmit}
            onClick={submit}
          />
        </div>
      </div>
    </div>
  );
}

function HtmlToPdfSuccess({ downloadUrl, onStartOver }: { downloadUrl: string; onStartOver: () => void }) {
  const { copied, handleDownload, handleCopy } = useDownloadActions(downloadUrl, "webpage.pdf");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
      >
        <Check className="h-10 w-10" aria-hidden />
      </motion.div>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Your PDF is ready</h1>

      <Card variant="default" padding={6} className="mt-8 w-full shadow-soft">
        <VStack gap={3}>
          <div className="flex flex-wrap justify-center gap-2">
            <Button label="Download" variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleDownload} />
            <Button
              label="Open"
              variant="secondary"
              icon={<ExternalLink className="h-4 w-4" />}
              href={`${downloadUrl}&disposition=inline`}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Button
              label={copied ? "Copied" : "Copy link"}
              variant="ghost"
              icon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              onClick={handleCopy}
            />
          </div>
        </VStack>
      </Card>

      <Button label="Convert another page" variant="ghost" className="mt-8" onClick={onStartOver} />
    </div>
  );
}
