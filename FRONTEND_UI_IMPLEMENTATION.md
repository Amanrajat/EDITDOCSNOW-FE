# Frontend UI/UX Redesign — Implementation Notes

This document describes the redesign of the EditDocsNow marketing site: navigation, homepage,
every tool page, the shared FAQ/instructions/related-tools system, the footer, responsive
behavior, SEO, and accessibility. No backend code was changed and no existing PDF tool's
upload/processing/download logic was modified — every change described here is presentational
or structural (new pages, new shared components, new data files, and a navigation rebuild).

## 1. Navbar structure

The old `Header.tsx` rendered a flat list of 22 links (`hidden sm:flex`), which meant mobile
users had no way to reach any tool at all. It's rebuilt on top of the existing
`@astryxdesign/core` design system's navigation primitives (`TopNav`, `TopNavMegaMenu`,
`TopNavMenu`, `TopNavItem`), wrapped in the design system's `AppShell` for responsive behavior:

```
EditDocsNow logo   PDF Tools ▼   Convert PDF ▼   Edit PDF ▼   Compress ▼   OCR   Resources ▼        [Upload PDF]
```

- **Home** link removed — the logo is the home link.
- **Upload PDF** appears exactly once, as the single CTA button on the right (no separate flat
  "Upload" nav item).
- **Compress** tools appear only in their own dropdown, not duplicated inside PDF Tools.
- All navigation data (labels, hrefs, icons, descriptions) lives in one file,
  `src/config/navigation.ts`, consumed by the Header, Footer, `/tools` directory, `/pdf-guides`,
  and the homepage tool showcase — so there is exactly one place to add or rename a tool.

## 2. Dropdown structure

- **PDF Tools** (`TopNavMegaMenu`): Merge, Split, Organize, Remove Pages, Rotate, Crop, Page
  Numbers — auto-arranged into a 2-column grid, each item with icon + title + one-line
  description.
- **Convert PDF** (`TopNavMegaMenu`, two labeled groups): "PDF → Other Formats" (Word, Excel,
  PowerPoint, JPG, Markdown, PDF/A) and "Other Formats → PDF" (Word, Excel, PowerPoint, JPG,
  HTML).
- **Edit PDF** (`TopNavMenu`, single item): "Advanced PDF Editor" → `/upload`. The visual/
  annotation editor only exists once a document is uploaded — there is no separate route for
  "Add Text"/"Images"/"Shapes" — so this is one rich item describing that capability, not
  several fake links.
- **Compress** (`TopNavMenu`): Compress PDF, Batch Compress.
- **OCR**: a direct `TopNavItem` link (no dropdown), since it's a single major feature.
- **Resources** (`TopNavMenu`): How It Works, PDF Guides, FAQ.

All of these use the design system's built-in popover mechanics: **click or hover to open**,
**closes on outside click and Escape** (native Popover API), and **keyboard/focus management**
handled by the design system — no hand-rolled dropdown logic was written.

## 3. Mobile navigation

`AppShell`'s `mobileNav={{ breakpoint: "lg" }}` switches the header to a hamburger below
**1024px** (covers both phone and tablet widths) and shows the full desktop mega-menu at
1024px and above. Below the breakpoint:

- The header collapses to logo + Upload PDF button + hamburger toggle (aria-label
  "Open navigation").
- Tapping it opens a native `<dialog>`-based drawer listing PDF Tools / Convert PDF / Edit PDF /
  Compress / OCR / Resources, each (except OCR) collapsible/expandable in place.
- The drawer closes on Escape (native dialog `cancel` event) and via its own close button.

This was verified with Playwright at 320/375/390/430/768/1024/1280/1440/1920px — no horizontal
overflow at any width, and the mobile-bar/desktop switch happens exactly at the 1024px boundary.

## 4. Homepage

- **Hero**: badge "Powerful PDF tools, all in one place", headline "Everything you need to work
  with PDFs.", subheading describing the edit/organize/compress/convert/OCR flow, primary CTA
  "Upload PDF" → `/upload`, secondary CTA "Explore PDF Tools" → `/tools`.
- **Tool showcase**: replaced the old 6-card "text editor features" grid with real
  `ToolCategory`/`ToolCard` sections — Organize PDFs, Compress PDFs, Convert PDFs, Edit PDFs,
  OCR — each card linking to its real, working route.
- **How it works**: corrected from a 4-step description of the old text-block editor to the
  actual generic flow every tool follows (Upload → Choose a tool → Configure & process →
  Download).
- **FAQ**: corrected from text-editor-specific questions to general, accurate platform FAQs
  (file types, account requirement, whether the original file is modified, retention, chaining
  tools).

## 5. Tools directory (`/tools`)

New route organizing every tool into: PDF Organization, PDF Optimization, PDF Conversion, Create
PDF, PDF Editing, OCR — plus a client-side search box that filters by title/description (22
tools justifies this per the brief). Fed entirely from `TOOL_CATEGORIES` in `navigation.ts`.

## 6. Service page structure

Every one of the 22 tool pages (plus `/upload`) now follows the same server/client split, since
Next.js can't export page `metadata` from a `"use client"` component:

```
page.tsx (server component)          →  <ToolSlug>Client.tsx (unchanged client component)
  - export const metadata             -  the ENTIRE original page.tsx content, moved verbatim
  - Breadcrumbs                       -  only the top-level export was renamed
  - <ToolSlug>Client />               -  (default export → named "XClient" export)
  - HowToUse
  - FAQSection
  - RelatedTools
```

No hook, service call, or upload/processing/download UI was touched — this was a pure
move-and-wrap so every page could gain metadata, breadcrumbs, instructions, FAQ, and related
tools without any functional risk. `/upload` got the same metadata treatment but not
Breadcrumbs/HowToUse/FAQ/RelatedTools, since it's the generic entry funnel rather than one of the
22 enumerated tools.

## 7. FAQ system

- `src/data/tool-faqs.ts` — `TOOL_FAQS: Record<slug, Faq[]>` plus `GENERAL_FAQS` for the
  homepage/`/faq` page, plus a `getToolFaqs(slug)` helper (returns `[]` for an unknown slug,
  and satisfies `noUncheckedIndexedAccess`).
- `src/components/common/FAQSection.tsx` — a single reusable accordion (built on the existing
  `Card`/`CollapsibleGroup` primitives already used by the old homepage-only `FAQ.tsx`), used on
  every tool page, the homepage, and `/faq`.
- All FAQ copy is grounded in the actual implemented behavior of each tool (verified by reading
  every tool's hook/page — e.g. OCR really supports exactly English/French/German/Spanish/Hindi,
  Compress really uses a 4-tier level enum rather than a numeric percentage, PDF/A really
  supports only 1b/2b/3b) — nothing was invented.

## 8. Instructions ("How to use") system

- `src/data/tool-howto.ts` — `TOOL_HOWTO: Record<slug, HowToStep[]>` plus `getHowToSteps(slug)`.
- `src/components/common/HowToUse.tsx` — numbered step list rendered on every tool page,
  describing the real, current workflow (e.g. Merge: upload → arrange order → merge → download).

## 9. Related tools

- `src/data/related-tools.ts` — `RELATED_TOOLS: Record<slug, slug[]>` plus `getRelatedSlugs`.
- `src/components/common/RelatedTools.tsx` renders a card row from real `ToolMeta` lookups
  (`getToolsBySlugs`) — every link points to an actual, working route.

## 10. Footer

Expanded from a 2-link footer (Home, Upload) to a five-column layout: brand + tagline, Product,
Convert, Tools, Resources — all sourced from `navigation.ts` so it can't drift from the real
route list. A Company column (About/Contact/Privacy/Terms) was intentionally **not** added,
since none of those pages exist and there's no real content to put on them — adding placeholder
legal/contact pages would violate the "no fake pages" requirement. Stacks to a responsive grid on
mobile (`grid-cols-2` → `sm:grid-cols-3` → `lg:grid-cols-5`).

## 11. Responsive breakpoints verified

320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px — no horizontal overflow at any width
(`document.documentElement.scrollWidth <= clientWidth` asserted in `e2e/navbar.spec.ts`).
Mobile drawer active ≤1024px, full desktop nav ≥1025px.

**A real overflow bug was found and fixed here, not band-aided.** At exactly 320px, the compact
mobile header row (logo + Upload CTA + hamburger) needed 325px — 5px of genuine horizontal
overflow. The root cause was the "Upload PDF" button label; the fix (`Header.tsx`'s `UploadCta`
sub-component, using the design system's `useTopNavRenderMode()` hook) shortens the label to
"Upload" specifically in the compact mobile-bar row, while the Hero's primary CTA keeps the full
"Upload PDF" text where there's room for it. No `overflow-x: hidden` was added anywhere as a
substitute for this fix.

## 12. Design system / reused components

Stayed within the existing dark-only orange/black/white palette (`tailwind.config.ts` documents
this as intentional) and the existing `@astryxdesign/core` design system — no new UI dependency
was added. Reused as-is: `Button`, `Card`, `VStack`, `Badge`, `Collapsible`/`CollapsibleGroup`,
`ProgressBar`, `SegmentedControl`, `TextInput`, `NumberInput`, `SelectableCard`, `Dialog`, all
existing tool-specific components (`MergeDropzone`, `RotatePageGrid`, `CompressLevelPicker`,
etc.), and `Logo`. Newly adopted from the same design system (previously unused by this app):
`TopNav`, `TopNavHeading`-alternative (`Logo` passed directly into `TopNav`'s `heading` slot),
`TopNavMegaMenu`, `TopNavMegaMenuItem`, `TopNavMenu`, `TopNavItem`, `AppShell`, `Breadcrumbs`/
`BreadcrumbItem`, `LinkProvider` (registered once in `AppProviders` so every Astryx component
defaults to Next.js's `<Link>` for client-side navigation).

## 13. SEO

Every tool page (21 tools + `/upload` + `/tools` + `/faq` + `/how-it-works` + `/pdf-guides`) now
exports real `metadata` (title, description, `alternates.canonical`) from a server component —
previously only the homepage had any metadata at all. Titles follow the existing root-layout
title template (`"%s · EditDocsNow"`) rather than manually appending the brand name a second
time. Open Graph/Twitter defaults are inherited from the root layout (`src/app/layout.tsx`),
which already sets `metadataBase`, OG image, and Twitter card metadata.

## 14. Accessibility

- Semantic `<nav>` landmarks (desktop nav, mobile drawer, footer columns each with `aria-label`).
- All interactive triggers are real `<button>`/`<a>` elements (design-system primitives).
- Dropdowns/drawer: click-triggered (not hover-only), Escape-to-close, outside-click-to-close,
  visible focus rings (`:focus-visible` in the design system's tokens).
- Breadcrumbs use semantic `<nav><ol>` markup via `@astryxdesign/core/Breadcrumbs`.
- FAQ accordions are real disclosure buttons (`role="button"`/`aria-expanded` via `Collapsible`).

## 15. E2E tests

- **New**: `e2e/navbar.spec.ts` (breakpoint overflow sweep, desktop dropdown open/outside-click/
  Escape, mega-menu column grouping, OCR active state via `aria-current`, mobile drawer open/
  collapse/Escape, single Upload CTA / no Home link) and `e2e/homepage.spec.ts` (hero CTAs,
  tool-card routes, FAQ accordion open/close, footer columns).
- **Existing suite**: all pre-existing specs were kept; **35 heading-role locators** across
  17 files (`e2e/`) and 3 files (`e2e-docker/`) had `exact: true` added (one file's locator used
  a regex, anchored with `^` instead) — every retrofitted tool page now also renders an
  `<h2>How to use {Tool Name}</h2>` heading, which is a substring of the page's own `<h1>` title,
  so Playwright's default substring-matching `getByRole("heading", { name: "..." })` became
  ambiguous. This is a locator-precision fix, not a functional change — the same behavior is
  still asserted, just disambiguated from the new content.

## 16. Known limitations

- `TopNavMegaMenu`/`TopNavMenu` (the design system's dropdown-group primitives) don't expose a
  "this whole group is active" prop — only plain `TopNavItem` (used for OCR) supports
  `isSelected`/`aria-current`. So while OCR shows an active state on `/ocr`, the PDF Tools/
  Convert PDF/Edit PDF/Compress/Resources dropdown *triggers* don't visually highlight when the
  current route belongs to that group. Fixing this would require a design-system change (a
  custom trigger slot) rather than app-level code.
- One pre-existing e2e failure (`e2e/compress.spec.ts` → "compresses an image-heavy PDF...")
  returns a 404 from the backend; this reproduces identically on the untouched `git stash`
  baseline, confirming it's a pre-existing backend/environment issue unrelated to this redesign.
- `e2e-docker/*` specs (OCR, Office↔PDF conversions requiring a real LibreOffice/Tesseract
  backend) were updated for the same locator fix but were not run in this environment (they're
  outside the default `playwright.config.ts` `testDir` and require a docker-based backend setup
  not available here).
- `AppShell` picks mobile-bar vs. desktop nav via a client-side `useMediaQuery` check with no
  server-side User-Agent hint (`mobileNav.defaultIsMobile` was deliberately left unset). Wiring
  up UA-based SSR detection would eliminate the brief pre-hydration flash where the initial paint
  assumes desktop, but doing so requires reading `headers()` in `(marketing)/layout.tsx`, which
  forces every marketing route to render dynamically on every request instead of being served as
  prebuilt static HTML — confirmed via `npm run build` (all 26 marketing routes flip from `○`
  static to `ƒ` dynamic). Given the flash is sub-second and self-corrects with zero steady-state
  overflow, keeping static generation for a real, ongoing performance/cost win was judged the
  better trade-off; `e2e/navbar.spec.ts` asserts against the settled (post-hydration) state,
  which is what a user actually sees and interacts with.

## Route / navigation map

| Route | Nav location |
|---|---|
| `/` | Logo |
| `/tools` | Hero secondary CTA ("Explore PDF Tools") |
| `/upload` | Navbar CTA, Hero primary CTA |
| `/merge`, `/split`, `/organize`, `/remove-pages`, `/rotate`, `/crop`, `/page-numbers` | PDF Tools ▼ |
| `/pdf-to-word`, `/pdf-to-excel`, `/pdf-to-powerpoint`, `/pdf-to-jpg`, `/pdf-to-markdown`, `/pdf-to-pdfa` | Convert PDF ▼ (PDF → Other Formats) |
| `/word-to-pdf`, `/excel-to-pdf`, `/powerpoint-to-pdf`, `/jpg-to-pdf`, `/html-to-pdf` | Convert PDF ▼ (Other Formats → PDF) |
| `/upload` (Advanced PDF Editor) | Edit PDF ▼ |
| `/compress`, `/batch-compress` | Compress ▼ |
| `/ocr` | OCR (direct link) |
| `/how-it-works`, `/pdf-guides`, `/faq` | Resources ▼ |
| `/editor/[documentId]` | Reached only after upload (minimal header, no marketing nav) |
