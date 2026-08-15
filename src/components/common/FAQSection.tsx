"use client";

import { Card } from "@astryxdesign/core/Card";
import { Collapsible, CollapsibleGroup } from "@astryxdesign/core/Collapsible";
import { VStack } from "@astryxdesign/core/VStack";
import type { Faq } from "@/data/tool-faqs";

interface FAQSectionProps {
  faqs: Faq[];
  title?: string;
}

/** Reusable, data-driven FAQ accordion — used on the homepage and on every
 * tool page, fed from src/data/tool-faqs.ts. */
export function FAQSection({ faqs, title = "Frequently asked questions" }: FAQSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        </div>
      )}

      <Card variant="default" padding={2} className={title ? "mt-8" : undefined}>
        <CollapsibleGroup type="single" defaultValue="q-0" hasDividers>
          <VStack gap={0}>
            {faqs.map((faq, index) => (
              <Collapsible key={faq.question} value={`q-${index}`} trigger={faq.question}>
                <p className="pb-2 text-sm leading-relaxed text-white/55">{faq.answer}</p>
              </Collapsible>
            ))}
          </VStack>
        </CollapsibleGroup>
      </Card>
    </section>
  );
}
