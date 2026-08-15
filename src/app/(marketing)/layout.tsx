import { AppShell } from "@astryxdesign/core/AppShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      variant="wash"
      height="auto"
      contentPadding={0}
      topNav={<Header />}
      mobileNav={{ breakpoint: "lg" }}
    >
      <main>{children}</main>
      <Footer />
    </AppShell>
  );
}
