# Agent Instructions

## Prohibited

- No em-dash (—). Use hyphen (-) or comma instead.
- No emoji in code, tests, comments, or config files. Emoji only in documentation if exceptionally apt.
- No AI-like language: "delve", "leverage", "utilize", "empower", "seamless", "robust", "cutting-edge", "revolutionize", "game-changer", "holistic", "ecosystem", "synergy", "transformative", "bespoke".
- No filler words: "simply", "just", "basically", "essentially", "actually", "very", "really", "quite", "notably", "importantly".
- No throat-clearing openers: "It is important to note that", "It should be mentioned that", "Let me elaborate on", "In order to", "It is worth noting that", "Please note that", "As previously mentioned".
- No passive voice. Write "the engine parses metadata", not "metadata is parsed by the engine".
- No nominalizations. Write "validate the address", not "perform validation on the address".
- No redundant qualifiers: "totally", "completely", "absolutely", "definitely", "literally", "essentially".

## Style

- Short phrases. One idea per sentence.
- Concrete terms. No abstractions where specifics work.
- Present tense. Write "the component renders", not "the component will render".
- Digits for numbers: "3 fields", not "three fields".
- US English spelling.

## Code

- TypeScript everywhere.
- Use const/let. Never var.
- Prefer early returns over nested ifs.
- Exhaustive error handling. No swallowed promises.
- Exports at the bottom of the file.
- Barrel files (`index.ts`) re-export only.
- No default exports in packages. Named exports only.

## Packages

- pnpm workspaces.
- tsup for bundling.
- ESM + CJS + Types outputs.
- Changesets for versioning.
- Vitest for testing.
- ESLint + Prettier.

## Architecture

- **Headless core.** Core (`@addresskit/core`) has zero UI dependencies. React package is a thin layer over core. Components consume data, not the reverse.
- **Provider pattern.** Every data source implements `AddressProvider` from core. Providers are stateless and tree-shakeable. Each provider lives in its own package.
- **Strict layering.** Core does not import React. Data packages do not import core. Providers implement interfaces defined by core.
- **Controlled components only.** `<Address>` uses value/onChange. No internal form state. The engine does not mutate input, it returns new objects.
- **Cascade clears.** Changing country clears state, city, and invalid fields. Changing state clears city. Always preserve valid fields for the new selection.
- **Lazy load data.** Countries, states, and cities load on demand. Never import all data at once. Use dynamic `import()` for data files. Each country is a separate chunk.
- **Validate at the engine level.** Validation lives in core, not in UI components. Return structured per-field errors. Support async validators for data-dependent checks.
- **SSR safety.** Load all data synchronously for first render. No `useEffect` required for initial data. No browser API references in core or data packages.
- **Error resilience.** Every provider handles its own errors. Remote providers fall back to empty data on fetch failure. Lost connection does not break the form.
- **Bundle discipline.** Each country's data is a separate chunk. Provider packages are optional peer dependencies. Zero dependencies on lodash, moment, or other heavy libraries.
- **Type safety.** Country codes are string literal unions. Use strict null checks. Use exhaustive switches on field types and country codes.
- **Feature flags.** Experimental APIs live behind an `experimental` namespace or explicit opt-in prop. Breaking changes before 1.0 bump minor.

## Testing

- Test behavior, not implementation.
- One assertion per test.
- Use describe/it, not nested describes.
- Mock at the boundary, not internally.

## Commits

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Present tense imperative: "add validation", not "added validation" or "adds validation".
- Short subject line (under 72 chars). Body only if needed.
