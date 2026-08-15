import type { HowToStep } from "@/data/tool-howto";

interface HowToUseProps {
  toolName: string;
  steps: HowToStep[];
}

/** Numbered "How to use" steps for a single tool page, grounded in
 * src/data/tool-howto.ts. Smaller/denser than the homepage's HowItWorks. */
export function HowToUse({ toolName, steps }: HowToUseProps) {
  if (steps.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        How to use {toolName}
      </h2>
      <ol className="mt-8 space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary-400">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-white">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
