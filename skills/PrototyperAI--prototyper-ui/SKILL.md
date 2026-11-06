---
name: prototyper-ui
description: "Prototyper UI component library (Tailwind CSS v4 + Base UI). Use when working with Prototyper UI components, installing components, customizing themes, or accessing component documentation."
metadata:
  author: prototyper-ui
  version: "2.0.0"
---

# Prototyper UI Development Guide

Composable, design-first React component library built on **@base-ui/react** primitives and **Tailwind CSS v4**. Copy-paste distribution (like shadcn/ui), OKLCH color system, CVA variants, compound components.

**CRITICAL: This library uses `@base-ui/react`, NOT `@radix-ui/react`.** Base UI is the official successor to Radix, maintained by the MUI team. Do NOT import from Radix packages. Do NOT assume shadcn/ui patterns work identically — always fetch docs first.

### Dependencies

```bash
pnpm add @base-ui/react class-variance-authority clsx tailwind-merge lucide-react
```

### Project Structure

```
your-app/
  components/ui/         <- component source files (copy-paste)
  lib/utils.ts           <- cn() utility (clsx + tailwind-merge)
  prototyper-tokens.css  <- design tokens
  app/globals.css        <- @import "tailwindcss"; @import "./prototyper-tokens.css";
```

### Required Setup

1. **Tailwind CSS v4** with `@tailwindcss/postcss`
2. **`lib/utils.ts`** exporting `cn()`:
   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
3. **`prototyper-tokens.css`** imported in globals.css (run `node scripts/theme.mjs` to get it)
4. **`next-themes`** for dark mode (`.dark` class strategy)

### Hello World — Button

```tsx
import { Button } from "@/components/ui/button";

export default function HelloWorld() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="destructive" size="sm">
        Delete
      </Button>
      <Button variant="outline" isPending>
        Loading...
      </Button>
    </div>
  );
}
```

---

## 2. Component Selection Guide

### What are you building?

```
What are you building?
├── A clickable action?
│   ├── Standard button ──────────────── Button (6 variants, 9 sizes)
│   ├── On/off toggle button ─────────── Toggle (2 variants)
│   └── Group of related actions ─────── Toolbar (keyboard nav)
│
├── A form input?
│   ├── Free text ────────────────────── TextField (Input, TextArea)
│   ├── Number with +/- ──────────────── NumberField (8 exports)
│   ├── Pick one from a list ─────────── Select (dropdown) or RadioGroup (inline)
│   ├── Pick from filtered list ──────── Combobox (autocomplete, 24 exports)
│   ├── Yes/no toggle ────────────────── Checkbox (animated) or Switch (3 sizes)
│   ├── Value in a range ─────────────── Slider (compound, 6 exports)
│   └── Need label/description/error? ── Wrap ANY input with Field
│
├── An overlay / popup?
│   ├── Modal with actions ───────────── Dialog
│   ├── Slide-in panel ───────────────── Dialog (with side= prop — no separate Sheet)
│   ├── Info popup on click ──────────── Popover
│   ├── Quick hint on hover ──────────── Tooltip
│   └── Action list on click ─────────── Menu (DropdownMenu)
│
├── Showing progress / status?
│   ├── Task completion ──────────────── Progress (label + value)
│   └── Value in known range ─────────── Meter (color-coded gauge)
│
└── Content navigation? ──────────────── Tabs (horizontal or vertical)
```

### Compound vs Simple

| Type                        | Components                                                                                                                                  | Exports |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Simple** (1-2 exports)    | Button, Toggle, RadioGroup                                                                                                                  | 2 each  |
| **Compound** (3-10 exports) | Checkbox (3), Tabs (5), Switch (5), Popover (6), Slider (6), Toolbar (6), Meter (7), Progress (7), NumberField (9), Field (10), Dialog (10) | 3-10    |
| **Large compound** (11+)    | Select (11), Menu (15), Combobox (24)                                                                                                       | 11-24   |

---

## 3. Copy-Paste Patterns

These six patterns cover ~95% of use cases. Copy them directly.

### Pattern A: Simple Action (Button)

```tsx
import { Button } from "@/components/ui/button"

// Basic variants
<Button variant="default">Primary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes: xs, sm, default, lg, icon-xs, icon-sm, icon, icon-lg
<Button size="sm">Small</Button>
<Button size="icon"><SearchIcon /></Button>

// Loading state — disables interaction, keeps visual
<Button isPending>Saving...</Button>

// Render as link — render= replaces asChild from Radix
<Button render={<a href="/about" />}>About</Button>
```

**Key API difference from shadcn:** `render=` prop replaces Radix's `asChild`. Pass a JSX element, and Base UI merges the props onto it. When using `render=` on Button, the `nativeButton` prop is automatically handled internally.

### Pattern B: Form Field (TextField + Field)

```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/textfield"

// Field wraps ANY input with label, description, error
<Field>
  <FieldLabel>Email</FieldLabel>
  <FieldDescription>We'll never share your email.</FieldDescription>
  <Input placeholder="you@example.com" />
  <FieldError>Please enter a valid email address.</FieldError>
</Field>

// With validation (invalid prop on Field)
<Field invalid={!!errors.email}>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required />
  <FieldError>{errors.email}</FieldError>
</Field>

// TextArea variant
import { TextArea } from "@/components/ui/textfield"

<Field>
  <FieldLabel>Message</FieldLabel>
  <TextArea rows={4} placeholder="Your message..." />
</Field>
```

**Field is a universal wrapper.** Use it around TextField, NumberField, Select, Combobox, Checkbox, Switch, RadioGroup — any form input that needs a label, description, or error message.

### Pattern C: Positioned Overlay (Popover)

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>
    Open Popover
  </PopoverTrigger>
  <PopoverContent side="bottom" align="center" sideOffset={4}>
    <PopoverHeader>
      <PopoverTitle>Settings</PopoverTitle>
      <PopoverDescription>Configure your preferences.</PopoverDescription>
    </PopoverHeader>
    {/* your content */}
  </PopoverContent>
</Popover>;
```

**Positioning props** (`side`, `sideOffset`, `align`, `alignOffset`) live on the Content component. Internally, they're forwarded to Base UI's Positioner layer — you don't need to think about Portal/Positioner/Popup yourself.

This same pattern applies to **Tooltip**, **Menu**, **Select**, and **Combobox** — all positioned overlays use side/align/offset. For Menu specifically:

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/menu";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>
    Actions
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      Edit <DropdownMenuShortcut>Cmd+E</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Pattern D: Compound Visual (Slider)

```tsx
import {
  Slider, SliderControl, SliderTrack,
  SliderIndicator, SliderThumb, SliderOutput,
} from "@/components/ui/slider"

<Slider defaultValue={50} min={0} max={100}>
  <SliderOutput />
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb />
    </SliderTrack>
  </SliderControl>
</Slider>

// Multi-thumb range slider
<Slider defaultValue={[25, 75]}>
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb />  {/* automatically creates one per value */}
      <SliderThumb />
    </SliderTrack>
  </SliderControl>
</Slider>
```

**Compound visual components** have a strict nesting order. The sub-components must be nested correctly — they communicate via React context.

### Pattern E: Selection Input (Select + Field)

```tsx
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";

<Field>
  <FieldLabel>Country</FieldLabel>
  <Select>
    <SelectTrigger size="default">
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>North America</SelectLabel>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Europe</SelectLabel>
        <SelectItem value="uk">United Kingdom</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
  <FieldError>Please select a country.</FieldError>
</Field>;
```

### Pattern F: Dialog & Sheet (Unified)

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Standard center dialog
<Dialog>
  <DialogTrigger render={<Button />}>Edit Profile</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile.</DialogDescription>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Sheet variant — just add side= prop
<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Open Sheet</DialogTrigger>
  <DialogContent side="right">  {/* "top" | "bottom" | "left" | "right" */}
    <DialogHeader>
      <DialogTitle>Navigation</DialogTitle>
    </DialogHeader>
    {/* sheet content */}
  </DialogContent>
</Dialog>
```

**There is no separate Sheet component.** Dialog handles both center modals and side sheets via the `side` prop. When `side` is set, the dialog slides in from that edge. When omitted, it's a standard centered modal.

---

## 4. Design System Reference

### Token Selection: "I need a background — which token?"

```
What kind of element needs a background?
├── The page itself ────────────────── bg-background
├── A card / raised surface ────────── bg-surface (or bg-card)
├── A nested surface ───────────────── bg-surface-secondary / bg-surface-tertiary
├── An overlay (popover/dialog/menu) ── bg-overlay
├── A form input ───────────────────── bg-field-background
├── A primary action ───────────────── bg-primary
├── A destructive action ───────────── bg-destructive
├── A hover state (interactive) ────── hover-only:hover:bg-accent
├── A selected/active state ────────── bg-accent
├── Muted / secondary text area ────── bg-muted
└── A subtle tint of primary ───────── bg-primary-soft
```

### Color Format (OKLCH)

Tokens store raw OKLCH channels. Tailwind utilities are pre-registered via `@theme`:

```css
/* Token definition */
--primary: 55% 0.24 264;              /* lightness chroma hue */

/* In Tailwind — just use the utility */
className="bg-primary text-primary-foreground"

/* In raw CSS — wrap with oklch() */
background: oklch(var(--primary));
```

**Never** use `hsl(var(--primary))`, hardcoded hex, or `bg-[oklch(55%_0.24_264)]`.

### Token Categories

| Category           | Tokens                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Base**           | `background`, `foreground`, `border`, `border-light`, `border-dark`, `input`, `ring`, `radius`             |
| **Primary ramp**   | `primary`, `primary-light`, `primary-middle`, `primary-dark`, `primary-foreground`                         |
| **Semantic**       | `secondary`, `muted`, `accent`, `destructive` (each with `-foreground`)                                    |
| **Status**         | `success`, `warning`, `info` (each with `-foreground`)                                                     |
| **Surfaces**       | `surface`, `surface-secondary`, `surface-tertiary`, `card`, `popover`, `overlay` (each with `-foreground`) |
| **Fields**         | `field-background`, `field-border`, `field-border-hover`, `field-border-invalid`                           |
| **Derived hovers** | `primary-hover`, `destructive-hover`, `success-hover`, `warning-hover`, `accent-hover`                     |
| **Derived soft**   | `primary-soft`, `primary-soft-hover`, `destructive-soft`, `destructive-soft-hover`                         |

### Derived Colors (Auto-Generated)

Hover states use `color-mix()` — no manual darkening:

```css
--primary-hover: color-mix(
  in oklab,
  oklch(var(--primary)) 90%,
  oklch(var(--primary-foreground)) 10%
);
--primary-soft: color-mix(in oklab, oklch(var(--primary)) 15%, transparent);
```

Use as: `hover-only:hover:bg-primary-hover`, `bg-primary-soft`.

### Shadow Tiers

| Tier    | Token            | Use for                  | Dark mode                   |
| ------- | ---------------- | ------------------------ | --------------------------- |
| Surface | `shadow-surface` | Cards, raised sections   | `none` (tonal contrast)     |
| Field   | `shadow-field`   | Form inputs              | `none` (tonal contrast)     |
| Overlay | `shadow-overlay` | Popovers, dialogs, menus | Subtle border + deep shadow |

### Dark Mode

Dark mode activates via `.dark` class (next-themes). Token values swap automatically — you never write `dark:bg-*` classes. Shadows for surface and field become `none` in dark mode (depth comes from tonal contrast instead). Overlay shadows get a subtle white border ring.

### Easing Tokens

| Token              | Utility          | When to use                                        |
| ------------------ | ---------------- | -------------------------------------------------- |
| `--ease-smooth`    | `ease-smooth`    | State transitions (color, bg, border changes)      |
| `--ease-out-fluid` | `ease-out-fluid` | Elements entering (overlays, sheets, switch thumb) |
| `--ease-in-quart`  | `ease-in-quart`  | Elements exiting (overlay dismiss)                 |
| `--ease-out-quad`  | `ease-out-quad`  | Available, currently unused                        |
| `--ease-out-quart` | `ease-out-quart` | Available, currently unused                        |
| `--ease-in-quad`   | `ease-in-quad`   | Available, currently unused                        |

### CSS Utilities

| Utility              | Purpose                                | Use on                                               |
| -------------------- | -------------------------------------- | ---------------------------------------------------- |
| `focus-ring`         | 2px ring, 2px offset                   | Buttons, toggles, links (`focus-visible:focus-ring`) |
| `focus-field-ring`   | 2px ring, -1px offset (sits on border) | Form inputs (`focus-within:focus-field-ring`)        |
| `invalid-field-ring` | Destructive-colored ring               | Invalid fields (`data-invalid:invalid-field-ring`)   |
| `status-disabled`    | opacity 0.5 + no pointer events        | Disabled elements (`disabled:status-disabled`)       |
| `status-pending`     | No pointer events only                 | Loading states (`pending:status-pending`)            |
| `no-highlight`       | Remove mobile tap highlight            | All interactive elements                             |

### Custom Tailwind Variants

| Variant          | Meaning                                 | Use for                                                 |
| ---------------- | --------------------------------------- | ------------------------------------------------------- |
| `motion-reduce:` | `prefers-reduced-motion: reduce`        | Disable transitions/animations                          |
| `motion-safe:`   | `prefers-reduced-motion: no-preference` | Gate press feedback (`motion-safe:active:scale-[0.97]`) |
| `hover-only:`    | `@media (hover: hover)`                 | Prevent sticky hover on touch devices                   |

---

## 5. Component Architecture

### Sub-component Patterns

| Pattern                      | Structure                                  | Used by                                          |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------ |
| **Root + Trigger + Content** | Overlay with trigger/popup pair            | Dialog, Popover, Tooltip, Menu, Select, Combobox |
| **Visual compound**          | Root + Track + Indicator + Thumb           | Slider, Switch, Meter, Progress                  |
| **Positioned overlay**       | Portal → Positioner → Popup (internal)     | Popover, Tooltip, Menu, Select, Combobox         |
| **Internal context**         | Root provides size/state via React context | Switch (size), Slider (value)                    |
| **Presentational wrapper**   | Plain `<div>` with styling                 | DialogHeader, DialogFooter, PopoverHeader        |

### Component File Header

Every component file follows this strict pattern:

```tsx
"use client"; // Always first line

import * as React from "react"; // Only when needed
import { Component as ComponentPrimitive } from "@base-ui/react/component-name";
import { cva, type VariantProps } from "class-variance-authority";
import { SomeIcon } from "lucide-react"; // Icons

import { cn } from "@/lib/utils"; // Internal utilities last
```

**Always** use deep path Base UI imports (`@base-ui/react/dialog`), never barrel imports. Alias primitives with `Primitive` suffix to avoid naming conflicts with your wrapper components.

### Props Type Conventions

Components extend Base UI primitive props + CVA VariantProps:

```tsx
// Simple component
function Button({
  className, variant, size, isPending, render, ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  isPending?: boolean
}) { ... }

// Overlay content — merge Popup + Positioner positioning props
function PopoverContent({
  className, side = "bottom", sideOffset = 4, align = "center", ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">
) { ... }
```

### The `render=` Prop (Base UI's `asChild` Replacement)

Base UI does not use Radix's `asChild`. Instead, it provides `render=` which takes a JSX element:

```tsx
// Render trigger as a Button
<DialogTrigger render={<Button variant="outline" />}>
  Open Dialog
</DialogTrigger>

// Render close as a Button
<DialogClose render={<Button variant="ghost" />}>
  Cancel
</DialogClose>

// Render as a link
<Button render={<a href="/about" />}>About Us</Button>
```

Base UI merges all primitive props (event handlers, ARIA attributes, refs) onto your element. The `render=` prop can also accept a function `render={(props) => <Custom {...props} />}` but the JSX element form is preferred.

### `data-slot` Convention

Every rendered element gets a `data-slot` attribute for CSS targeting:

```tsx
<button data-slot="button" />
<div data-slot="dialog-header" />
<div data-slot="select-content" />
```

Pattern: root = component name (`button`), sub-components = `{root}-{role}` (`dialog-header`, `select-item`).

---

## 6. Styling & Customization

### className Overrides

All components accept `className`. It's merged via `cn()` (tailwind-merge) — your classes win over defaults:

```tsx
<Button className="w-full rounded-full">Full Width Pill</Button>
```

### CSS Targeting via data-slot

Style components from parent CSS without prop drilling:

```css
[data-slot="button"] {
  /* targets all buttons */
}
[data-slot="dialog-content"] {
  /* targets dialog panels */
}
```

### Reusing CVA Variants

Use variant functions on non-component elements (e.g., making a link look like a button):

```tsx
import { buttonVariants } from "@/components/ui/button";

<a href="/about" className={buttonVariants({ variant: "outline", size: "sm" })}>
  About
</a>;
```

### Token Overrides

Override any design token in your `globals.css`:

```css
:root {
  --primary: 60% 0.2 150; /* green primary instead of blue */
  --radius: 0.75rem; /* larger border radius */
}
```

### Custom Tailwind Variants

```tsx
// Only apply hover on devices that support it (prevents sticky hover on touch)
"hover-only:hover:bg-accent";

// Only animate for users who haven't requested reduced motion
"motion-safe:active:scale-[0.97]";

// Disable animation for users who prefer reduced motion
"motion-reduce:transition-none";
"motion-reduce:animate-none";
```

### Animation Conventions

Prototyper UI uses **CSS-first animation** — no framer-motion dependency.

- **State transitions**: `transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth` + `motion-reduce:transition-none`
- **Press feedback**: `motion-safe:active:scale-[0.97]` (buttons), `scale-[0.98]` (menu items), `scale-[0.95]` (small controls like checkbox)
- **Overlay enter/exit**: `data-open:animate-in` / `data-closed:animate-out` with `fade-in`/`zoom-in-95`/directional slides
- **Signature easing**: `--ease-out-fluid` (`cubic-bezier(0.32, 0.72, 0, 1)`)
- **Split timing**: colors 100-150ms, transforms 250ms, enter > exit (300ms→200ms)
- **Never**: `transition-all`, bare `active:scale-*`, animations without `motion-reduce:` alternative

For detailed animation patterns, invoke the `/animate-ui` skill.

---

## 7. Accessibility Checklist

Every component should address:

- [ ] **Motion reduction**: Add `motion-reduce:transition-none` on elements with `transition-*` classes. Add `motion-reduce:animate-none` on elements with `animate-in`/`animate-out`.
- [ ] **Touch safety**: Use `hover-only:hover:` instead of bare `hover:` for background/color changes. Add `no-highlight` utility on interactive elements.
- [ ] **Press feedback**: Always prefix with `motion-safe:` — never bare `active:scale-*`.
- [ ] **Focus management**: Use `focus-visible:focus-ring` for buttons/toggles/links. Use `focus-within:focus-field-ring` for form field groups.
- [ ] **Keyboard navigation**: Handled by Base UI automatically — Arrow keys for RadioGroup, Tabs, Menu, Toolbar, Select. Escape to close overlays. Enter/Space to activate.

---

## 8. Common Mistakes

### Import Mistakes

| #   | Wrong                                              | Correct                                                             | Why                                              |
| --- | -------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `import * as Dialog from "@radix-ui/react-dialog"` | `import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"` | Base UI, not Radix. Deep path import, aliased.   |
| 2   | `export default Button`                            | `export { Button, buttonVariants }`                                 | Named exports only, never default.               |
| 3   | `const Button = React.forwardRef(...)`             | `function Button({ className, ...props })`                          | No forwardRef — Base UI handles refs internally. |

### Styling Mistakes

| #   | Wrong                          | Correct                                                                            | Why                                                                        |
| --- | ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 4   | `bg-[hsl(var(--primary))]`     | `bg-primary`                                                                       | OKLCH tokens registered via @theme — use Tailwind utilities directly.      |
| 5   | `transition-all duration-200`  | `transition-[color,background-color,border-color,box-shadow,opacity] duration-150` | Never `transition-all` — enumerate properties explicitly.                  |
| 6   | `hover:bg-accent`              | `hover-only:hover:bg-accent`                                                       | Gate hovers with `hover-only:` to prevent sticky hover on touch.           |
| 7   | `active:scale-95`              | `motion-safe:active:scale-[0.97]`                                                  | Always `motion-safe:` prefix, and use exact scale values (0.97/0.98/0.95). |
| 8   | No `data-slot` attribute       | `data-slot="component-name"` on every element                                      | Required on every rendered element in every sub-component.                 |
| 9   | `shadow-lg` / `shadow-md`      | `shadow-surface` / `shadow-field` / `shadow-overlay`                               | Use semantic shadow tiers, not generic Tailwind shadows.                   |
| 10  | `focus:ring-2 focus:ring-ring` | `focus-visible:focus-ring` (buttons) or `focus-within:focus-field-ring` (fields)   | Use utility classes — they handle ring width, color, and offset.           |

### Architecture Mistakes

| #   | Wrong                               | Correct                                                        | Why                                                                      |
| --- | ----------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 11  | `<Dialog.Close asChild>`            | `<DialogClose render={<Button />}>`                            | Base UI uses `render=`, not `asChild`.                                   |
| 12  | `data-[state=open]:animate-in`      | `data-open:animate-in`                                         | Base UI uses boolean data attributes, not `data-state` values.           |
| 13  | `tv({ variants: {...} })`           | `cva("base classes", { variants: {...} })`                     | CVA (`class-variance-authority`), never Tailwind Variants.               |
| 14  | `dark:bg-gray-800`                  | Token swap via `.dark` class in `prototyper-tokens.css`        | Dark mode is token-based — values swap automatically, no `dark:` needed. |
| 15  | Transition without `motion-reduce:` | `motion-reduce:transition-none` alongside every `transition-*` | Always provide reduced-motion alternative.                               |

### Component-Specific Mistakes

| #   | Wrong                                           | Correct                                                                             | Why                                                              |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 16  | `import { Sheet } from "@/components/ui/sheet"` | `<DialogContent side="right">`                                                      | No separate Sheet — Dialog's `side` prop creates sheet behavior. |
| 17  | `<Input />` without Field wrapper               | `<Field><FieldLabel>Name</FieldLabel><Input /><FieldError>...</FieldError></Field>` | Always wrap form inputs with Field for label/description/error.  |
| 18  | Bare `<Popover.Content>` without positioning    | `<PopoverContent side="bottom" sideOffset={4}>`                                     | Positioning props are part of the Content component's API.       |

---

## 9. Component Reference

| Component       | Key Exports                                                                                                                                                                   | Type                 | Variants                 | Notable                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------ | ------------------------------- |
| **Button**      | Button, buttonVariants                                                                                                                                                        | Simple               | variant (6), size (9)    | `isPending`, `render=`          |
| **Toggle**      | Toggle, toggleVariants                                                                                                                                                        | Simple               | variant (2), size (3)    | `aria-pressed` state            |
| **Toolbar**     | Toolbar, ToolbarButton, ToolbarLink, ToolbarGroup, ToolbarSeparator, ToolbarInput                                                                                             | Compound (6)         | —                        | Keyboard nav, orientation       |
| **TextField**   | Input, inputVariants, TextField, TextArea                                                                                                                                     | Compound (4)         | size (3)                 | Integrated Field wrapper        |
| **NumberField** | NumberField, NumberFieldGroup, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement, NumberFieldSteppers, NumberFieldScrubArea, NumberFieldScrubAreaCursor            | Compound (9)         | size (3)                 | Scrub area for drag-increment   |
| **Checkbox**    | Checkbox, CheckboxControl, CheckboxIndicator                                                                                                                                  | Compound (3)         | —                        | Animated SVG draw-on            |
| **Switch**      | Switch, SwitchTrack, SwitchThumb, SwitchIcon, switchVariants                                                                                                                  | Compound (5)         | size (sm/md/lg)          | Context-driven sizing           |
| **RadioGroup**  | RadioGroup, RadioGroupItem                                                                                                                                                    | Compound (2)         | —                        | Inline radio buttons            |
| **Slider**      | Slider, SliderControl, SliderTrack, SliderIndicator, SliderThumb, SliderOutput                                                                                                | Compound (6)         | —                        | Multi-thumb, animated fill      |
| **Select**      | Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, selectTriggerVariants | Compound (11)        | size (3)                 | Portal + Positioner pattern     |
| **Combobox**    | Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, + 18 more                                                                                | Compound (24)        | —                        | Chips/multi-select, filter hook |
| **Menu**        | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, + 11 more                                                                                           | Compound (15)        | item variant (2)         | Submenus, checkbox/radio items  |
| **Dialog**      | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogOverlay, DialogPortal                                    | Compound (10)        | side (4)                 | Unified dialog + sheet          |
| **Popover**     | Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription                                                                                      | Compound (6)         | —                        | Positioned overlay              |
| **Tooltip**     | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider                                                                                                                      | Compound (4)         | —                        | Delay, built-in arrow           |
| **Tabs**        | Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants                                                                                                                    | Compound (5)         | variant (2), orientation | Horizontal/vertical             |
| **Field**       | Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle                                                  | Super-component (10) | orientation (3)          | Universal form wrapper          |
| **Meter**       | Meter, MeterTrack, MeterIndicator, MeterLabel, MeterValue, meterIndicatorVariants, meterTrackVariants                                                                         | Compound (7)         | color (4)                | Gauge display                   |
| **Progress**    | Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue, progressIndicatorVariants, progressTrackVariants                                                    | Compound (7)         | color (4)                | Indeterminate state             |

---

## 10. Documentation Access

### Scripts

```bash
# List all available components
node scripts/list.mjs

# Get component documentation (full docs + source + examples)
node scripts/docs.mjs button
node scripts/docs.mjs button dialog select    # multiple at once

# Get component source code only
node scripts/source.mjs button

# Get design tokens CSS
node scripts/theme.mjs
```

### Direct URLs

| URL                                               | Content                               |
| ------------------------------------------------- | ------------------------------------- |
| `https://prototyper-ui.com/llms.txt`              | Full component index                  |
| `https://prototyper-ui.com/llms/{component}`      | Component docs (e.g., `/llms/button`) |
| `https://prototyper-ui.com/llms-full.txt`         | All docs in one file                  |
| `https://prototyper-ui.com/llms-components.txt`   | Component listing                     |
| `https://prototyper-ui.com/prototyper-tokens.css` | Design tokens CSS                     |

### MCP Server

```bash
claude mcp add prototyper-ui -- npx -y @prototyperco/mcp@latest
```

Tools: `list_components`, `get_component_docs`, `get_component_source`, `get_theme`, `search_docs`.

### Always Fetch First

Before implementing any component, **always fetch its documentation** using the scripts or URLs above. Do not assume Radix/shadcn patterns work identically. Component APIs, data attributes, and animation conventions all differ from what you might expect.
