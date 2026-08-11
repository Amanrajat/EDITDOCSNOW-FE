import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-dark-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileQuestion className="h-10 w-10" aria-hidden />
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          404
        </h1>
        <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">
          We couldn&apos;t find the page you&apos;re looking for. It may have been moved, or the
          link might be incorrect.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button label="Back to home" variant="primary" as={Link} href="/" />
          <Button label="Upload a PDF" variant="secondary" as={Link} href="/upload" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
