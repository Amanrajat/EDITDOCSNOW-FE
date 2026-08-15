import { FAQSection } from "@/components/common/FAQSection";
import { GENERAL_FAQS } from "@/data/tool-faqs";

/** Homepage FAQ — general, platform-wide questions. Individual tool pages
 * use FAQSection directly with tool-specific data from tool-faqs.ts. */
export function FAQ() {
  return <FAQSection faqs={GENERAL_FAQS} />;
}
