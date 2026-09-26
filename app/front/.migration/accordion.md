# Accordion

2026-07-04, transformation engine (new-york legacy style, no base-new-york registry counterpart), clean migration.

## Changed

**src/components/ui/accordion.tsx**: created from stock new-york registry content, then transformed in place.

- Import: `@radix-ui/react-accordion` → named import `{ Accordion as AccordionPrimitive } from "@base-ui/react/accordion"` (the module exports `{ Accordion: { Root, Item, Header, Trigger, Panel } }`, not a bare namespace)
- `Accordion` root: `AccordionPrimitive.Root` (no `type`/`collapsible` props at wrapper level; consumers pass the `multiple` bool instead of `type="multiple"`)
- `AccordionItem`: `AccordionPrimitive.Item`, no change to class or structure
- `AccordionTrigger`: chevron selector `[&[data-state=open]>svg]:rotate-180` → `[&[data-panel-open]>svg]:rotate-180` (Base UI sets `data-panel-open` on the trigger when the panel is open)
- `AccordionContent` → wraps `AccordionPrimitive.Panel`; animation moved to inner div: `h-(--accordion-panel-height) overflow-hidden transition-[height] data-starting-style:h-0 data-ending-style:h-0`; custom keyframes `animate-accordion-down/up` removed
- CSS var: `--radix-accordion-content-height` → `--accordion-panel-height` (in the inner div class)
- `@base-ui/react 1.6.0` added to dependencies

Leftover sweep: `grep -n "radix-ui\|@radix-ui" src/components/ui/accordion.tsx` → 0 hits
Typecheck: `pnpm tsc --noEmit` → 0 errors

## Left Alone

- `src/components/ui/button.tsx`: still on Radix (`Slot` from `radix-ui`); out of scope for this migration
- Tailwind keyframes `accordion-down`/`accordion-up` in CSS: may remain as dead code; safe to remove from `src/styles/index.css` if present

## Behavior Changes

- **`type` and `collapsible` props removed at wrapper level.** Consumers of `<Accordion type="single" collapsible>` remove both props (Base UI defaults to single-open). `type="multiple"` becomes the `multiple` prop.
- **Value is always an array.** Base UI `Accordion.Root` value/defaultValue are `Value[]`. Consumers passing string values wrap them in an array.
- **Animation engine changed.** Radix used JS-measured `--radix-accordion-content-height` and CSS keyframes. Base UI uses `@starting-style` transitions via the `data-starting-style`/`data-ending-style` attributes. Requires browser support for `@starting-style` (Chrome 117+, Firefox 129+, Safari 17.5+).

## Verify by Hand

1. Render an accordion with 2 or 3 items; click a trigger: the panel opens with height animation
2. Click the open trigger: the panel collapses with animation
3. Chevron rotates 180° on open and returns on close
4. Keyboard: Tab to trigger, Enter/Space to open/close, Arrow keys move between triggers
5. Two items open simultaneously with the `multiple` prop; single-open by default
6. No flash-of-open on page load (panel starts closed)

**1 wrapper remains on Radix** (button.tsx)
