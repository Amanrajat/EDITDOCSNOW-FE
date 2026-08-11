import { Header } from "@/components/layout/Header";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-dark-background">
      <Header variant="minimal" />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
