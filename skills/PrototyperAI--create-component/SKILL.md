---
name: create-component
description: >
  Guide for creating new Prototyper UI components from scratch. Use when building
  a new component, wrapping a Base UI primitive, adding sub-components, setting up
  registry entries, writing examples, or scaffolding MDX documentation pages.
tools: [Read, Glob, Grep, Write, Edit, Bash]
---

# Prototyper UI — Creating Components

End-to-end guide for building new components in the Prototyper UI library. Templates first, then decision trees, then architecture patterns, then registration and documentation.

---

## 1. Copy-Paste Templates

These four templates cover every component shape. Pick one, fill in the blanks.

### Template A: Simple Component (no sub-components)

Used by: Button, Toggle

```tsx
"use client";

import { ComponentName as ComponentNamePrimitive } from "@base-ui/react/component-name";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const componentNameVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth",
    "motion-reduce:transition-none",
    "focus-visible:focus-ring",
    "disabled:status-disabled",
    "no-highlight",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover-only:hover:bg-primary-hover",
        outline: "border border-border bg-surface hover-only:hover:bg-accent",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function ComponentName({
  className,
  variant,
  size,
  ...props
}: ComponentNamePrimitive.Props & VariantProps<typeof componentNameVariants>) {
  return (
    <ComponentNamePrimitive
      data-slot="component-name"
      className={cn(componentNameVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { ComponentName, componentNameVariants };
```

### Template B: Compound Visual Component (Root + sub-components sharing context)

Used by: Switch, Slider, Meter, Progress

```tsx
"use client";

import * as React from "react";
import { ComponentName as ComponentNamePrimitive } from "@base-ui/react/component-name";

import { cn } from "@/lib/utils";

// --- Context (only when sub-components need shared state) ---

type ComponentNameSize = "sm" | "md" | "lg";
type ComponentNameContextValue = { size: ComponentNameSize };
const ComponentNameCtx = React.createContext<ComponentNameContextValue>({
  size: "md",
});

// --- Root ---

function ComponentName({
  className,
  children,
  size = "md",
  ...props
}: ComponentNamePrimitive.Root.Props & { size?: ComponentNameSize }) {
  return (
    <ComponentNameCtx value={{ size }}>
      <ComponentNamePrimitive.Root
        data-slot="component-name"
        className={cn("group", className)}
        {...props}
      >
        {children}
      </ComponentNamePrimitive.Root>
    </ComponentNameCtx>
  );
}

// --- Sub-component: Track ---

function ComponentNameTrack({
  className,
  ...props
}: ComponentNamePrimitive.Track.Props) {
  const { size } = React.useContext(ComponentNameCtx);
  return (
    <ComponentNamePrimitive.Track
      data-slot="component-name-track"
      className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        size === "sm" && "h-1",
        size === "md" && "h-2",
        size === "lg" && "h-3",
        className,
      )}
      {...props}
    />
  );
}

// --- Sub-component: Indicator ---

function ComponentNameIndicator({
  className,
  ...props
}: ComponentNamePrimitive.Indicator.Props) {
  return (
    <ComponentNamePrimitive.Indicator
      data-slot="component-name-indicator"
      className={cn(
        "h-full bg-primary",
        "transition-[width,background-color] duration-300 ease-smooth",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { ComponentName, ComponentNameTrack, ComponentNameIndicator };
```

### Template C: Positioned Overlay (Portal → Positioner → Popup)

Used by: Popover, Tooltip, Menu, Select, Combobox

```tsx
"use client";

import { ComponentName as ComponentNamePrimitive } from "@base-ui/react/component-name";

import { cn } from "@/lib/utils";

// --- Root (pass-through) ---

function ComponentName(props: ComponentNamePrimitive.Root.Props) {
  return <ComponentNamePrimitive.Root data-slot="component-name" {...props} />;
}

// --- Trigger ---

function ComponentNameTrigger({
  className,
  ...props
}: ComponentNamePrimitive.Trigger.Props) {
  return (
    <ComponentNamePrimitive.Trigger
      data-slot="component-name-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

// --- Content (wraps Portal → Positioner → Popup internally) ---

function ComponentNameContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: ComponentNamePrimitive.Popup.Props &
  Pick<
    ComponentNamePrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <ComponentNamePrimitive.Portal>
      <ComponentNamePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <ComponentNamePrimitive.Popup
          data-slot="component-name-content"
          className={cn(
            // Layout
            "min-w-[8rem] rounded-lg p-1",
            "bg-overlay text-overlay-foreground shadow-overlay",
            // Enter animation
            "data-open:animate-in data-open:duration-150",
            "data-open:[animation-timing-function:var(--ease-out-fluid)]",
            "data-open:fade-in-0 data-open:zoom-in-95",
            // Exit animation
            "data-closed:animate-out data-closed:duration-100",
            "data-closed:[animation-timing-function:var(--ease-in-quart)]",
            "data-closed:fade-out-0 data-closed:zoom-out-95",
            // Direction-aware slide
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            // Origin + performance + accessibility
            "origin-(--transform-origin)",
            "data-entering:will-change-[opacity,transform]",
            "data-exiting:will-change-[opacity,transform]",
            "motion-reduce:animate-none motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </ComponentNamePrimitive.Positioner>
    </ComponentNamePrimitive.Portal>
  );
}

export { ComponentName, ComponentNameTrigger, ComponentNameContent };
```

### Template D: Dialog / Full-Screen Overlay (with backdrop)

Used by: Dialog, AlertDialog

```tsx
"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

function ComponentName(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="component-name" {...props} />;
}

function ComponentNameTrigger({
  className,
  ...props
}: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot="component-name-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

function ComponentNameOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="component-name-overlay"
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        "data-open:animate-in data-closed:animate-out",
        "data-closed:fade-out-0 data-open:fade-in-0",
        "duration-200",
        "motion-reduce:animate-none motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function ComponentNamePortal(props: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal data-slot="component-name-portal" {...props} />
  );
}

function ComponentNameContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <ComponentNamePortal>
      <ComponentNameOverlay />
      <DialogPrimitive.Popup
        data-slot="component-name-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg rounded-xl bg-overlay p-6 shadow-overlay",
          "data-open:animate-in data-closed:animate-out",
          "data-closed:fade-out-0 data-open:fade-in-0",
          "data-closed:zoom-out-[0.98] data-open:zoom-in-[1.02]",
          "duration-200 ease-out-fluid",
          "data-entering:will-change-[opacity,transform]",
          "data-exiting:will-change-[opacity,transform]",
          "motion-reduce:animate-none motion-reduce:transition-none",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </ComponentNamePortal>
  );
}

// --- Presentational wrappers ---

function ComponentNameHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-name-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function ComponentNameFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-name-footer"
      className={cn("flex justify-end gap-2", className)}
      {...props}
    />
  );
}

function ComponentNameTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="component-name-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function ComponentNameDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="component-name-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ComponentNameClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="component-name-close" {...props} />;
}

export {
  ComponentName,
  ComponentNameTrigger,
  ComponentNameContent,
  ComponentNameOverlay,
  ComponentNamePortal,
  ComponentNameHeader,
  ComponentNameFooter,
  ComponentNameTitle,
  ComponentNameDescription,
  ComponentNameClose,
};
```

---

## 2. Component Type Decision Tree

```
What kind of component are you building?
│
├── A single interactive element? (button, toggle, link)
│   └── Template A — Simple Component
│       ├── Has variants? → CVA with variant/size
│       └── No variants? → Plain function, no CVA
│
├── A visual compound? (track + thumb, indicator + label)
│   └── Template B — Compound Visual
│       ├── Sub-components need shared state? → Add React context
│       └── No shared state needed? → Skip context, pass via className
│
├── A positioned popup? (appears near trigger)
│   └── Template C — Positioned Overlay
│       ├── Has items/list? → Add Item sub-component (like Menu, Select)
│       ├── Has arrow? → Add Arrow sub-component
│       └── Simple content? → Just Content with children
│
├── A modal/full-screen overlay? (blocks page interaction)
│   └── Template D — Dialog Overlay
│       ├── Side panel? → Add side= CVA variant (sheet)
│       └── Centered? → Fixed center positioning
│
├── A form input?
│   ├── Wraps a native <input>? → Template A + integrate with Field
│   └── Custom control? → Template B + hidden input for form submission
│
└── A presentational wrapper? (header, footer, section)
    └── Plain div with data-slot + className merge
        function Wrapper({ className, ...props }: React.ComponentProps<"div">) {
          return <div data-slot="wrapper" className={cn("...", className)} {...props} />
        }
```

### When to use which Base UI primitive

```
Does Base UI have a primitive for this component?
│
├── Yes → Import and wrap it
│   ├── Single part (Button, Toggle) → Wrap directly
│   └── Multi-part (Dialog, Popover, Slider) → Wrap each sub-part
│
├── Partially → Compose from multiple primitives
│   (e.g., Toolbar uses Button primitive + custom keyboard nav)
│
└── No primitive exists → Invoke /build-primitive skill
    ├── Presentational? → Semantic HTML + data-slot + CVA
    ├── Interactive? → ARIA + keyboard + controlled state
    ├── Form control? → + hidden inputs + Field compatibility
    └── Complex composite? → + roving focus + focus trap
```

---

## 3. Step-by-Step Workflow

### Phase 1: Research

1. **Check Base UI docs** — Does a primitive exist? What sub-parts does it expose?
   ```
   https://base-ui.com/react/components/{component-name}
   ```
2. **Check existing Prototyper UI components** — Is there a similar component to reference?
   ```
   ls apps/docs/registry/ui/
   ```
3. **Identify the template** — Use the decision tree above to pick A, B, C, or D.

### Phase 2: Implement

4. **Create component file** at `apps/docs/registry/ui/{component-name}.tsx`
5. **Follow the file header pattern strictly:**
   ```
   "use client"                          ← Always line 1
   import from "@base-ui/react/..."      ← Base UI (deep path, aliased)
   import { cva } from "cva"             ← CVA (only if variants needed)
   import { Icon } from "lucide-react"   ← Icons (only if needed)
   import { cn } from "@/lib/utils"      ← Internal utilities last
   import { Dep } from "@/registry/ui/dep" ← Internal component deps
   ```
6. **Implement each sub-component** — one function per sub-component, not classes.
7. **Add data-slot** to every rendered element.
8. **Add animation classes** — invoke `/animate-ui` skill for exact patterns.
9. **Export all components and variants** — named exports only, single export block at end.

### Phase 3: Register

10. **Add registry entry** to `apps/docs/registry/registry.ts`
11. **Create example files** in `apps/docs/registry/example/{component-name}/`
12. **Run `pnpm registry:build`** to generate JSON + `__registry__.tsx`

### Phase 4: Document

13. **Create MDX page** at `apps/docs/content/docs/components/{component-name}.mdx`
14. **Run `pnpm dev`** and verify visually at `localhost:3333`

---

## 4. Base UI Wrapping Patterns

### Import Convention

Always use **deep path imports** with an **alias**:

```tsx
// Correct — deep path, aliased with "Primitive" suffix or component name
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

// Wrong — barrel import
import { Dialog } from "@base-ui/react";

// Wrong — no alias (conflicts with your wrapper name)
import { Dialog } from "@base-ui/react/dialog";
```

### Accessing Sub-Parts

Base UI exposes sub-parts as properties on the namespace:

```tsx
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

DialogPrimitive.Root; // <Dialog.Root>
DialogPrimitive.Trigger; // <Dialog.Trigger>
DialogPrimitive.Portal; // <Dialog.Portal>
DialogPrimitive.Backdrop; // <Dialog.Backdrop>
DialogPrimitive.Popup; // <Dialog.Popup>
DialogPrimitive.Title; // <Dialog.Title>
DialogPrimitive.Description; // <Dialog.Description>
DialogPrimitive.Close; // <Dialog.Close>
```

### Accessing TypeScript Types

Props and state types live on the sub-part namespace:

```tsx
// Props type for wrapper functions
ComponentNamePrimitive.Root.Props;
ComponentNamePrimitive.Trigger.Props;
ComponentNamePrimitive.Popup.Props;
ComponentNamePrimitive.Positioner.Props;

// State type for render functions
ComponentNamePrimitive.Root.State;
ComponentNamePrimitive.Popup.State;

// Simple components (no sub-parts)
ButtonPrimitive.Props;
```

### The `render=` Prop (NOT `asChild`)

Base UI uses `render=` instead of Radix's `asChild`. Pass a JSX element — Base UI merges all props (handlers, ARIA, refs) onto it:

```tsx
// Render trigger as a custom Button
<DialogPrimitive.Trigger render={<Button variant="outline" />}>
  Open
</DialogPrimitive.Trigger>

// Render as a link
<ButtonPrimitive render={<a href="/about" />}>About</ButtonPrimitive>

// Render function (for state-dependent rendering)
<ComponentNamePrimitive.Thumb
  render={(props, state) => (
    <span {...props}>
      {state.checked ? <CheckIcon /> : <XIcon />}
    </span>
  )}
/>
```

**When `render=` is passed to Button**, set `nativeButton={false}` to avoid rendering a `<button>` inside another element:

```tsx
function Button({ render, nativeButton, ...props }: ...) {
  return (
    <ButtonPrimitive
      render={render}
      nativeButton={nativeButton ?? (render ? false : undefined)}
      {...props}
    />
  )
}
```

### Data Attributes (NOT `data-state`)

Base UI uses **boolean data attributes**, not Radix-style `data-state="open"`:

```
Base UI (correct)          Radix (wrong)
─────────────────          ──────────────
[data-open]                [data-state="open"]
[data-closed]              [data-state="closed"]
[data-checked]             [data-state="checked"]
[data-unchecked]           [data-state="unchecked"]
[data-disabled]            [data-disabled]  (same)
[data-highlighted]         [data-highlighted]  (same)
[data-pressed]             [data-state="on"]
[data-dragging]            (no equivalent)
[data-starting-style]      (no equivalent)
[data-ending-style]        (no equivalent)
```

In Tailwind, target these with `data-open:`, `data-closed:`, `data-checked:`, etc.

### Overlay Internal Architecture

Every positioned overlay follows the same three-layer structure internally:

```
Portal (renders at document body, escapes parent overflow/z-index)
  └── Positioner (calculates position relative to anchor, receives side/align/offset)
        └── Popup (the visible content, receives animation + styling classes)
```

The **Content** wrapper you expose to users hides this:

```tsx
function PopoverContent({ side, sideOffset, align, alignOffset, className, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side} sideOffset={sideOffset}
        align={align} alignOffset={alignOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(/* styling + animation */, className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
```

Users write `<PopoverContent side="top">` — they never see Portal/Positioner/Popup.

---

## 5. Props & TypeScript Patterns

### Props Type Decision Tree

```
What type of component?
│
├── Simple (single element, has CVA)
│   → PrimitiveName.Props & VariantProps<typeof variants> & { custom?: type }
│
├── Simple (single element, no CVA)
│   → PrimitiveName.Props & { custom?: type }
│
├── Compound root (has sub-parts)
│   → PrimitiveName.Root.Props & { custom?: type }
│
├── Overlay content (Popup + Positioner positioning)
│   → PrimitiveName.Popup.Props &
│     Pick<PrimitiveName.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">
│
├── Presentational wrapper (plain div)
│   → React.ComponentProps<"div">
│
└── Semantic wrapper (Title, Description)
    → PrimitiveName.Title.Props  (or Description.Props, etc.)
```

### Props Destructuring Order

Always destructure in this order:

```tsx
function Component({
  className,        // 1. className (always first)
  variant,          // 2. CVA variant props
  size,             // 3. CVA size props
  side,             // 4. Positioning props (overlays)
  sideOffset,
  align,
  alignOffset,
  isPending,        // 5. Custom boolean state props
  children,         // 6. children (only if you need to wrap/modify)
  ...props          // 7. Rest spread (always last)
}: PropsType) {
```

### Default Values

Set defaults in the destructuring, not in `defaultVariants` logic:

```tsx
// Correct — default in destructuring
function Component({ variant = "default", size = "default", side = "bottom", sideOffset = 4 }: ...) {

// Wrong — default in body
function Component({ variant, size }: ...) {
  const v = variant ?? "default"  // Don't do this
```

### No `forwardRef`

Base UI handles ref forwarding internally. Never use `React.forwardRef`:

```tsx
// Correct
function Button({ className, ...props }: ButtonPrimitive.Props) {
  return <ButtonPrimitive {...props} />;
}

// Wrong
const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return <ButtonPrimitive ref={ref} {...props} />;
});
```

---

## 6. Styling Patterns

### className Merge Order

Always follow this order in `cn()`:

```tsx
cn(
  // 1. CVA variants (or static base classes)
  componentVariants({ variant, size }),

  // 2. Conditional classes (state-based)
  isPending && "status-pending",
  isActive && "bg-accent",

  // 3. User className (always last — wins over everything via twMerge)
  className,
);
```

### Standard Base Classes

Every interactive element should include these base utilities:

| Utility                         | Purpose                     | When                              |
| ------------------------------- | --------------------------- | --------------------------------- |
| `no-highlight`                  | Remove mobile tap highlight | All interactive elements          |
| `focus-visible:focus-ring`      | Keyboard focus indicator    | Buttons, toggles, links, triggers |
| `focus-within:focus-field-ring` | Field focus indicator       | Form input wrappers               |
| `disabled:status-disabled`      | Visual disabled state       | All interactive elements          |
| `motion-reduce:transition-none` | Respect reduced motion      | Any element with `transition-*`   |

### SVG Icon Normalization

Add to any component that may contain inline SVG icons:

```tsx
"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";
```

This ensures icons default to `size-4` (unless explicitly sized), can't capture pointer events, and don't shrink in flex layouts.

### State Transition Classes

The standard state transition string (for color/background/border changes):

```tsx
"transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth";
"motion-reduce:transition-none";
```

Never use `transition-all`. Enumerate exactly which properties transition.

### Token Usage

```
Background    → bg-surface, bg-overlay, bg-field-background, bg-primary, bg-accent
Text          → text-foreground, text-muted-foreground, text-primary-foreground
Border        → border-border, border-field-border
Shadow        → shadow-surface, shadow-field, shadow-overlay
Hover         → hover-only:hover:bg-primary-hover, hover-only:hover:bg-accent
Press         → motion-safe:active:scale-[0.97]
```

Always use `hover-only:hover:` (never bare `hover:`) and `motion-safe:active:` (never bare `active:scale-*`).

### Dark Mode

Never use `dark:` utility classes. Token values swap automatically via `.dark` class on `<html>`. If you need dark-mode-only behavior, use the token system in `globals.css`.

---

## 7. Context Pattern

### When to Use Context

```
Do sub-components need shared information from Root?
│
├── Size that affects multiple children → Context
│   (Switch: size affects Track width + Thumb diameter)
│
├── Computed values from Root props → Context
│   (Slider: value/min/max needed by Indicator for fill %)
│
├── Just className differences? → No context (pass via cn())
│
└── Only Root uses the value? → No context (local variable)
```

### Context Implementation Pattern

```tsx
// 1. Define type + create context with safe default
type ComponentNameContextValue = { size: "sm" | "md" | "lg" }
const ComponentNameCtx = React.createContext<ComponentNameContextValue>({ size: "md" })

// 2. Root provides context
function ComponentName({ size = "md", children, ...props }: ...) {
  return (
    <ComponentNameCtx value={{ size }}>
      <ComponentNamePrimitive.Root {...props}>
        {children}
      </ComponentNamePrimitive.Root>
    </ComponentNameCtx>
  )
}

// 3. Sub-components consume context
function ComponentNameThumb({ className, ...props }: ...) {
  const { size } = React.useContext(ComponentNameCtx)
  return (
    <ComponentNamePrimitive.Thumb
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}
```

**Rules:**

- Context always has a default value (never `undefined`)
- Use `React.createContext` at module scope (not inside a function)
- Use `React.useContext` in sub-components (not `useContext` from Root)
- Name format: `{ComponentName}Ctx` (short, clear)
- Value type format: `{ComponentName}ContextValue`

---

## 8. `data-slot` Convention

### Naming Rules

| Component Type | Root `data-slot` | Sub-component `data-slot`                |
| -------------- | ---------------- | ---------------------------------------- |
| Simple         | `"button"`       | —                                        |
| Compound root  | `"switch"`       | `"switch-track"`, `"switch-thumb"`       |
| Overlay root   | `"popover"`      | `"popover-trigger"`, `"popover-content"` |
| Overlay items  | —                | `"select-item"`, `"select-label"`        |
| Presentational | —                | `"dialog-header"`, `"dialog-footer"`     |

```
Pattern: {component-family}-{sub-element}
         kebab-case throughout
         root gets just the family name
```

### What Gets a `data-slot`

```
Does this element render to the DOM?
│
├── It wraps a Base UI primitive → YES, add data-slot
├── It's a presentational <div> (header, footer) → YES, add data-slot
├── It's a context provider only → NO (no DOM output)
└── It's a Portal (no visible output) → Optional (Dialog does, others don't)
```

---

## 9. Registry & Examples

### Registry Entry

Add to `apps/docs/registry/registry.ts`:

```tsx
{
  name: "component-name",
  type: "registry:ui",
  description: "One-line description of the component.",
  category: "Actions" | "Forms" | "Overlays" | "Navigation" | "Feedback",
  dependencies: ["@base-ui/react"],                    // npm packages
  registryDependencies: ["utils"],                     // other registry items
  files: [{ path: "ui/component-name.tsx", type: "registry:ui" }],
},
```

**Category rules:**

| Category   | Components                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| Actions    | Button, Toggle, Toolbar                                                               |
| Forms      | Checkbox, Combobox, Field, NumberField, RadioGroup, Select, Slider, Switch, TextField |
| Overlays   | Dialog, Menu, Popover, Tooltip                                                        |
| Navigation | Tabs                                                                                  |
| Feedback   | Meter, Progress                                                                       |

**Dependencies — when to include:**

| Dependency                 | When                                       |
| -------------------------- | ------------------------------------------ |
| `@base-ui/react`           | Always (every component wraps a primitive) |
| `class-variance-authority` | Component uses CVA variants                |
| `lucide-react`             | Component renders Lucide icons internally  |
| `@radix-ui/react-icons`    | Component renders Radix icons internally   |
| `vaul`                     | Drawer component only                      |
| `sonner`                   | Toast component only                       |

**`registryDependencies`** — reference other registry items by name:

```tsx
registryDependencies: ["utils"],                // Almost always
registryDependencies: ["utils", "button"],      // Component renders Button internally
registryDependencies: ["utils", "field"],       // Form input that depends on Field
```

### Example Files

Location: `apps/docs/registry/example/{component-name}/{example-name}.tsx`

**Naming convention:**

- `{component-name}-demo.tsx` — Primary demo (required)
- `{component-name}-{variant}.tsx` — Variant demos
- `{component-name}-with-{feature}.tsx` — Feature showcase

**Structure:**

```tsx
import { ComponentName } from "@/registry/ui/component-name";

export default function ComponentNameDemo() {
  return <ComponentName>{/* minimal working example */}</ComponentName>;
}
```

**Rules:**

- Always `export default function` (the registry requires default exports)
- Import from `@/registry/ui/` (not `@/components/ui/`)
- Keep examples minimal — demonstrate one concept each
- Use other Prototyper UI components in examples (Button for triggers, Field for form wrapping)

### Build

```bash
pnpm registry:build
```

Generates:

- `public/r/{name}.json` — shadcn-compatible install payload
- `public/r/index.json` — registry index
- `registry/__registry__.tsx` — lazy-loaded example index

---

## 10. MDX Documentation Page

Location: `apps/docs/content/docs/components/{component-name}.mdx`

### Template

````mdx
---
title: ComponentName
description: One-line description matching registry entry
links:
  source: registry/ui/component-name.tsx
  baseui: https://base-ui.com/react/components/component-name
---

<ComponentPreview name="component-name-demo" />

## Installation

<PackageManagers
  commands={{
    pnpm: "pnpm dlx shadcn@latest add https://prototyper-ui.com/r/component-name.json",
    npm: "npx shadcn@latest add https://prototyper-ui.com/r/component-name.json",
    yarn: "npx shadcn@latest add https://prototyper-ui.com/r/component-name.json",
    bun: "bunx --bun shadcn@latest add https://prototyper-ui.com/r/component-name.json",
  }}
/>

## Usage

```tsx
import { ComponentName } from "@/components/ui/component-name";
```
````

```tsx
<ComponentName>Example</ComponentName>
```

## Examples

### Variant Name

<ComponentPreview name="component-name-variant" />

## Styling

### Data Slots

| Slot name              | Element      |
| ---------------------- | ------------ |
| `component-name`       | Root element |
| `component-name-track` | The track    |

## API Reference

<TypeTable
type={{
    variant: {
      description: "Visual style of the component",
      type: '"default" | "outline"',
      default: '"default"',
    },
  }}
/>

## Accessibility

Keyboard interactions, ARIA attributes, screen reader behavior.

## Related

<RelatedComponents name="component-name" />
```

---

## 11. Checklist

Run through this before considering a component complete.

### Structure

- [ ] `"use client"` is line 1
- [ ] Imports follow order: `@base-ui/react` → CVA → icons → `cn` → local
- [ ] Deep path Base UI import with alias (`as ComponentNamePrimitive`)
- [ ] Named exports only (no `export default`)
- [ ] Single `export { }` block at end of file

### Every Element

- [ ] `data-slot` attribute on every rendered DOM element
- [ ] `className` prop accepted and merged via `cn()` (user class last)
- [ ] No `React.forwardRef` — Base UI handles refs

### Interactivity

- [ ] `focus-visible:focus-ring` on buttons/toggles/triggers
- [ ] `focus-within:focus-field-ring` on form input wrappers
- [ ] `disabled:status-disabled` on disableable elements
- [ ] `no-highlight` on all interactive elements
- [ ] `hover-only:hover:` prefix on all hover states (never bare `hover:`)
- [ ] `motion-safe:active:scale-[0.97]` for press feedback (never bare `active:`)

### Animation

- [ ] `motion-reduce:transition-none` alongside every `transition-*`
- [ ] `motion-reduce:animate-none` alongside every `animate-in`/`animate-out`
- [ ] Overlay animations follow the exact patterns from `/animate-ui` skill
- [ ] `origin-(--transform-origin)` on all positioned overlay popups
- [ ] `data-entering:will-change-[...]` / `data-exiting:will-change-[...]` on animated overlays
- [ ] Exit animations faster than enter (100ms exit vs 150ms enter)

### Tokens

- [ ] Using semantic tokens (`bg-primary`, `shadow-overlay`) not raw colors
- [ ] No `dark:` classes — token swap handles dark mode
- [ ] No `transition-all` — properties explicitly enumerated
- [ ] No bare `shadow-lg`/`shadow-md` — use `shadow-surface`/`shadow-field`/`shadow-overlay`

### Registry

- [ ] Entry added to `registry/registry.ts` with correct dependencies
- [ ] Example created at `registry/example/{name}/{name}-demo.tsx`
- [ ] `pnpm registry:build` runs without errors
- [ ] MDX page created at `content/docs/components/{name}.mdx`
- [ ] Component renders correctly in dev server

### TypeScript

- [ ] Props type uses `&` intersection (Primitive.Props & VariantProps & custom)
- [ ] Overlay Content uses `Pick<Positioner.Props, ...>` for positioning
- [ ] Default values in destructuring, not in function body
- [ ] No type assertions (`as`) unless absolutely necessary

---

## 12. Common Mistakes

| #   | Mistake                              | Fix                                                        |
| --- | ------------------------------------ | ---------------------------------------------------------- |
| 1   | Import from `@radix-ui/react`        | Use `@base-ui/react/{component}` with alias                |
| 2   | Use `asChild` prop                   | Use `render=` prop instead                                 |
| 3   | `data-[state=open]` selectors        | Use `data-open:` (boolean attributes)                      |
| 4   | `React.forwardRef` wrapper           | Remove — Base UI handles refs                              |
| 5   | `export default Component`           | Use `export { Component }` (named only)                    |
| 6   | `transition-all`                     | Enumerate: `transition-[color,background-color,...]`       |
| 7   | `hover:bg-accent`                    | Use `hover-only:hover:bg-accent`                           |
| 8   | `active:scale-95`                    | Use `motion-safe:active:scale-[0.97]`                      |
| 9   | Missing `data-slot`                  | Add to every rendered element                              |
| 10  | `dark:bg-gray-800`                   | Use tokens — they swap automatically                       |
| 11  | `shadow-lg`                          | Use `shadow-surface` / `shadow-field` / `shadow-overlay`   |
| 12  | Missing `motion-reduce:`             | Add alongside every `transition-*` and `animate-*`         |
| 13  | `bg-[hsl(var(--primary))]`           | Use `bg-primary` (OKLCH tokens registered via @theme)      |
| 14  | Barrel import `@base-ui/react`       | Deep path: `@base-ui/react/dialog`                         |
| 15  | Default export in example            | Must be `export default function` (not `export const`)     |
| 16  | Context without default              | Always `createContext({ size: "md" })` with safe default   |
| 17  | Positioning on wrong layer           | `side`/`align`/`offset` go on Positioner, styling on Popup |
| 18  | Missing `isolate z-50` on Positioner | Required for correct stacking                              |

---

## 13. Cross-References

- **No Base UI primitive exists**: Invoke `/build-primitive` for ARIA contracts, keyboard navigation, focus management, controlled/uncontrolled state, form integration — building from scratch
- **Animation details**: Invoke `/animate-ui` for exact easing, duration, and per-component overlay classes
- **Component API reference**: Invoke `/prototyper-ui` for design tokens, component selection, and copy-paste usage patterns
- **Base UI primitives**: `https://base-ui.com/react/components/{name}` for primitive API docs
