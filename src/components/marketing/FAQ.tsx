"use client";

import { Card } from "@astryxdesign/core/Card";
import { Collapsible } from "@astryxdesign/core/Collapsible";
import { CollapsibleGroup } from "@astryxdesign/core/Collapsible";
import { VStack } from "@astryxdesign/core/VStack";

const FAQS = [
  {
    question: "What file types are supported?",
    answer: "EditDocsNow currently accepts PDF files only, up to 20MB per upload.",
  },
  {
    question: "Will my formatting stay the same?",
    answer:
      "Yes. We only replace the text content of each detected block — font, size, color, and position stay exactly where they were.",
  },
  {
    question: "Can I re-extract blocks after editing?",
    answer:
      "Re-running extraction re-scans the original file and replaces all blocks, so any unsaved edits are lost. Save your changes before extracting again.",
  },
  {
    question: "Is there a limit on how many times I can save?",
    answer:
      "No. Every save regenerates the PDF from the original file using the current text of all blocks, so edits made across multiple sessions accumulate correctly.",
  },
  {
    question: "Where is my file stored?",
    answer:
      "Your file is processed by the EditDocsNow backend and kept only for as long as needed to serve your edits and downloads.",
  },
];

export function FAQ() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <Card variant="default" padding={2} className="mt-12">
        <CollapsibleGroup type="single" defaultValue="q-0" hasDividers>
          <VStack gap={0}>
            {FAQS.map((faq, index) => (
              <Collapsible key={faq.question} value={`q-${index}`} trigger={faq.question}>
                <p className="pb-2 text-sm leading-relaxed text-white/55">
                  {faq.answer}
                </p>
              </Collapsible>
            ))}
          </VStack>
        </CollapsibleGroup>
      </Card>
    </section>
  );
}
