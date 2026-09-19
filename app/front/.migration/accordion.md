# accordion

2026-07-04, transformation engine (new-york legacy style — no base-new-york registry counterpart), clean migration.

## Changed

**src/components/ui/accordion.tsx** — created fresh from stock new-york registry content, then transformed in-place.

- Import: `@radix-ui/react-accordion` → named import `{ Accordion as AccordionPrimitive } from "@base-ui/react/accordion"` (the module exports `{ Accordion: { Root, Item, Header, Trigger, Panel } }`, not a bare namespace)
- `Accordion` root: `AccordionPrimitive.Root` (no `type`/`collapsible` props needed at wrapper level; consumers must pass `multiple` bool instead of `type="multiple"`)
- `AccordionItem`: `AccordionPrimitive.Item` — no change to class or structure
- `AccordionTrigger`: chevron selector `[&[data-state=open]>svg]:rotate-180` → `[&[data-panel-open]>svg]:rotate-180` (Base UI sets `data-panel-open` on trigger when panel is open)
- `AccordionContent` → wraps `AccordionPrimitive.Panel`; animation moved to inner div: `h-(--accordion-panel-height) overflow-hidden transition-[height] data-starting-style:h-0 data-ending-style:h-0`; custom keyframes `animate-accordion-down/up` removed
- CSS var: `--radix-accordion-content-height` → `--accordion-panel-height` (embedded in inner div class)
- `@base-ui/react 1.6.0` added to dependencies

Leftover sweep: `grep -n "radix-ui\|@radix-ui" src/components/ui/accordion.tsx` → 0 hits ✓
Typecheck: `pnpm tsc --noEmit` → 0 errors ✓

## Left alone

- `src/components/ui/button.tsx` — still on Radix (`Slot` from `radix-ui`); out of scope for this migration
- Tailwind keyframes `accordion-down`/`accordion-up` in CSS — may remain as dead code; safe to remove from `src/styles/index.css` if present

## Behavior changes

- **`type` + `collapsible` props removed at wrapper level.** Consumers using `<Accordion type="single" collapsible>` must migrate: remove both props (Base UI defaults to single-open behavior). `type="multiple"` → add `multiple` prop.
- **Value is always an array.** Base UI `Accordion.Root` value/defaultValue are `Value[]`. Consumers passing string values must wrap in array.
- **Animation engine changed.** Radix used JS-measured `--radix-accordion-content-height` + CSS keyframes. Base UI uses `@starting-style`-based transitions via `data-starting-style`/`data-ending-style` data attributes. Requires browser support for `@starting-style` (Chrome 117+, Firefox 129+, Safari 17.5+).

## Verify by hand

1. Render accordion with 2–3 items; click trigger → panel opens with height animation
2. Click open trigger → panel collapses with animation
3. Chevron rotates 180° on open, returns on close
4. Keyboard: Tab to trigger, Enter/Space to open/close, Arrow keys move between triggers
5. Open two items simultaneously (if `multiple` prop set) vs. single-open default
6. Confirm no flash-of-open on page load (panel starts closed)

**1 wrapper remains on Radix** (button.tsx)
