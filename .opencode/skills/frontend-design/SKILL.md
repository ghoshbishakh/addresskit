---
name: frontend-design
description: Use when building the GitHub Pages site, designing UI components, styling pages, or creating the public-facing website for addresskit. Covers Tailwind, shadcn/ui, Next.js static export, and design conventions.
---

# Frontend Design

## Stack

- Next.js 15 (App Router) with `output: "export"` for static hosting
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- shadcn/ui components
- shiki for syntax highlighting in docs
- Inter font for headings, system-ui for body

## Design Tokens

- Max content width: 1280px
- Border radius: `0.5rem` (cards), `0.375rem` (inputs/buttons)
- Shadows: `shadow-sm` for cards, `shadow-md` for dropdowns
- Transitions: `150ms ease` on hover/focus states
- Code blocks: dark background (`#1e1e2e`), 14px font, rounded

## Color Palette (shadcn neutral)

| Token         | Light          | Dark            |
| ------------- | -------------- | --------------- |
| `--background`  | `0 0% 100%`    | `240 10% 3.9%`  |
| `--foreground`  | `240 10% 3.9%` | `0 0% 98%`     |
| `--primary`     | `221 83% 53%`  | `217 91% 60%`   |
| `--primary-foreground` | `210 40% 98%` | `210 40% 98%` |
| `--muted`       | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--card`        | `0 0% 100%`    | `240 10% 3.9%`  |
| `--border`      | `240 5.9% 90%` | `240 3.7% 15.9%` |

## Component Conventions

- Use `cn()` from `@/lib/utils` for class merging
- Every interactive element needs focus-visible ring
- Labels use `font-medium` (500 weight)
- Required fields show red `*` after label text
- Error text uses `text-destructive` token at 14px
- Form inputs: full width, `h-10` height, `px-3` padding
- Select dropdowns: match input height and padding, native `<select>` styled with Tailwind
- All forms use `space-y-4` between fields

## Layout

- Navigation: top bar with logo (left), nav links (center), GitHub button + theme toggle (right)
- Docs: sidebar on desktop (256px), sheet drawer on mobile
- Content area: `max-w-3xl mx-auto` for docs, `max-w-5xl` for examples
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`

## Code Examples

- Always use TypeScript with explicit types
- Show imports in full
- Use `"use client"` directive for interactive examples
- Wrap provider examples with `AddressProviderContext`
- One code block per concept, not walls of code

## Pages to Build

### Landing (`/`)
Hero, feature cards, live mini-demo, stats bar, footer.

### Playground (`/playground`)
Full interactive form with country selector, provider toggle, theme toggle, JSON output, validate and format buttons.

### Docs (`/docs/[...slug]`)
Sidebar + MDX content: getting started, components, providers, headless API, customization, framework integrations.

### Examples (`/examples`)
Grid of cards linking to live examples: libaddress, dr5hn, headless, RHF, restricted, custom fields, multi-step, validation, cascading.

## Accessibility

- All inputs have associated `<label>` elements
- Error messages use `aria-describedby` on the input
- Color is never the sole indicator of state
- Skip-to-content link on every page
- Focus trap in mobile nav

## Content

- No AI-like language (per AGENTS.md)
- Short, concrete sentences
- Examples over explanations
- Consistent heading hierarchy: `h1` per page, `h2` per section, `h3` per sub-section

## Deployment

- GitHub Actions workflow: build + deploy to `gh-pages`
- Static export via `output: "export"` in next.config.ts
- No API routes, no ISR, no SSR
- All dynamic features use `"use client"` + data fetched at build time

## Skill Directory

Base directory for this skill: `/Users/bishakhghosh/Projects/addresskit/packages/examples/nextjs`
