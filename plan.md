# AddressKit Development Plan

> Open-source, headless address component for React and other frameworks.

---

## Phase 1: Foundation  -  Core Engine & React Component

**Goal:** Working address engine with country metadata parsing, validation, a basic React component, and SSR support (Next.js App Router + Pages Router).

### 1.1 Repository Scaffolding

- [x] Initialize pnpm workspace root with `pnpm-workspace.yaml`
- [x] Configure TypeScript (`tsconfig.json` base)
- [x] Set up `tsup` for bundling
- [x] Configure ESLint + Prettier
- [x] Set up Vitest
- [x] Configure Changesets for versioning
- [x] Create `packages/` directory structure
- [x] Add `.gitignore`

### 1.2 @addresskit/core  -  Address Engine

- [x] Define core TypeScript interfaces (`Address`, `Field`, `Schema`, `ValidationResult`)
- [x] Define `AddressProvider` interface (`getCountries`, `getStates`, `getCities`, `getMetadata`)
- [x] Build `AddressEngine` class:
  - [x] `getSchema(country)`  -  generate form schema from metadata
  - [x] `validate(address)`  -  validate required fields, postal code regex, administrative area
  - [x] `format(address)`  -  format address per country template
  - [x] `clearInvalidValues(address, prevCountry, newCountry)`  -  cascade clear on country change
- [x] Implement metadata parsing for libaddressinput format
- [x] Export `@addresskit/core` package via tsup (ESM + CJS + Types)

### 1.3 @addresskit/data  -  Bundled Data

- [x] Add libaddressinput metadata as a data source
- [x] Bundle country metadata JSON (field order, labels, required fields, postal regex)
- [x] Lazy-load per-country metadata
- [x] Export `@addresskit/data` package via tsup

### 1.4 @addresskit/providers/libaddressinput  -  Metadata Provider

- [x] Implement `AddressProvider` using libaddressinput metadata
- [x] Parse and expose country-specific field ordering, labels, required fields, postal regex

### 1.5 @addresskit/react  -  React Package

- [x] Build `useAddressSchema(country)` hook (headless schema access)
- [x] Build `useAddressProvider()` context hook
- [x] Create `AddressProvider` context wrapper
- [x] Build high-level `<Address>` component:
  - [x] Controlled `value`/`onChange` API
  - [x] `allowedCountries` prop for country restriction
  - [x] `components` prop for custom Input/Select/Combobox overrides
  - [x] Auto-generated form fields from schema
- [x] Implement default Input, Select, ComboBox components
- [x] Handle country change cascade (schema regeneration, value clearing, revalidation)
- [x] Handle state change cascade (city reload, value clearing) — requires state/city provider
- [x] SSR-safe initial render (no useEffect for first data load)
- [x] Test with Next.js App Router and Pages Router
- [x] Export `@addresskit/react` package via tsup

### 1.6 Validation Package

- [x] Build postal code validation per country regex from metadata
- [x] Build required field validation
- [x] Build administrative area validity check
- [x] Support custom validators injection
- [x] Return structured `ValidationResult` with per-field errors

### 1.7 Testing  -  Phase 1

- [x] Unit tests for metadata parsing
- [x] Unit tests for schema generation
- [x] Unit tests for validation (required fields, postal codes)
- [x] Unit tests for formatting
- [x] Unit tests for provider implementations (libaddressinput)
- [x] Integration tests for React rendering
- [x] Integration tests for country switching

---

## Phase 2: Headless API & Integrations

**Goal:** Expose headless rendering, integrate with React Hook Form, add countries/states/cities data provider, and provide Next.js examples.

### 2.1 Headless API

- [x] Finalize `useAddressSchema` hook API
- [x] Expose raw `Field` array for custom rendering
- [x] Document headless usage pattern
- [x] Build headless example in repo (with libaddressinput metadata)

### 2.2 React Hook Form Integration

- [x] Build `<AddressController>`  -  RHF-compatible wrapper
- [x] Provide controlled integration example
- [ ] Test with RHF validation modes

### 2.3 Examples  -  Next.js

- [x] Create `packages/examples/nextjs/`
- [x] Basic address form example
- [x] Country-restricted form example
- [x] Headless rendering example
- [x] RHF integration example

### 2.4 Examples  -  Vite

- [x] Create `packages/examples/vite/`
- [x] Basic address form example

### 2.5 Examples  -  Remix

- [ ] Create `packages/examples/remix/`
- [ ] Basic address form example

### 2.6 SSR Compatibility

- [ ] Ensure all components are SSR-safe
- [ ] Test with Next.js SSR
- [ ] Test with Remix SSR
- [ ] Fix any `window`/`document` references

### 2.7 Documentation  -  Phase 2

- [x] Write React integration guide
- [x] Write headless usage guide
- [x] Write Next.js guide
- [x] Write Vite guide
- [ ] Write Remix guide
- [x] Write React Hook Form guide

### 2.8 @addresskit/providers/dr5hn  -  Countries/States/Cities Provider

- [x] Bundle JSON from dr5hn Countries States Cities database
- [x] Implement `AddressProvider` for countries, states, and cities
- [x] Support local JSON loading
- [x] Support remote JSON loading (optional)
- [x] Support custom provider injection
- [ ] Lazy-load cities on demand
- [x] Wire state/city data into `<Address>` component
- [x] Wire state/city data into `useAddressSchema` hook

### 2.9 Testing  -  Phase 2

- [ ] Integration tests for state switching
- [ ] Integration tests for city switching
- [ ] Tests for dr5hn provider data loading
- [ ] Tests for lazy-loaded city imports
- [ ] Tests for custom provider injection

---

## Phase 3: Enterprise, Frameworks & Polish

**Goal:** Additional framework adapters, mature provider APIs, and documentation site.

### 3.1 Shadcn/ui Example

- [ ] Create `packages/examples/shadcn/`
- [ ] Build example with shadcn/ui styling
- [ ] Demonstrate component slot pattern

### 3.2 UI Framework Integration Guides

- [ ] Mantine integration example
- [ ] MUI integration example
- [ ] Chakra UI integration example
- [ ] Tailwind CSS styling guide

### 3.3 Vue Adapter

- [ ] Create `@addresskit/vue` package
- [ ] Build Vue composables (`useAddressSchema`)
- [ ] Build Vue component (`<Address>`)
- [ ] Vue example project
- [ ] Vue documentation

### 3.4 Svelte Adapter

- [ ] Create `@addresskit/svelte` package
- [ ] Build Svelte stores/stores
- [ ] Build Svelte component
- [ ] Svelte example project

### 3.5 Angular Adapter

- [ ] Create `@addresskit/angular` package
- [ ] Build Angular service and component
- [ ] Angular example project

### 3.6 React Native Adapter

- [ ] Create `@addresskit/react-native` package
- [ ] Build React Native components
- [ ] Handle native platform differences

### 3.7 Enterprise Provider APIs

- [ ] Hosted metadata CDN (optional)
- [ ] Server-side validation package (`@addresskit/validation-server`)
- [ ] Address normalization service interface
- [ ] Reverse geocoding provider interface

### 3.8 Advanced Features

- [ ] Zod schema generation from address schema
- [ ] JSON Schema generation
- [ ] Address diffing utility
- [ ] Address normalization
- [ ] Custom field injection API
- [ ] Custom validation rules API
- [ ] Country-specific tax identifier fields
- [ ] Phone number field integration
- [ ] Postal code lookup (autofill locality from postal code)

### 3.9 Documentation Site

- [ ] Build interactive playground
- [ ] Country selector + schema viewer
- [ ] Validation result viewer
- [ ] Live code editor for examples
- [ ] API reference docs
- [ ] Migration guide
- [ ] Contribution guide

### 3.10 E2E Testing

- [ ] Set up Playwright
- [ ] E2E tests for core user flows
- [ ] Cross-browser testing

---

## Phase 4: Developer Experience (DX)

**Goal:** Make the public API predictable, consistent, and pleasant to use — fix
correctness footguns, remove duplication, and smooth the React integration.
Derived from an architecture review; see [ARCHITECTURE.md](./ARCHITECTURE.md).

### 4.1 Correctness footguns (P0 — shipped)

- [x] `engine.format()` loads metadata on demand (now async) — no longer silently returns `""` when the cache wasn't primed
- [x] `format()` resolves `administrativeArea` code → display name (e.g. `CA` → `California`)
- [x] Normalize postal-code regex (`toPostalCodeRegex`) — fix double-anchoring (`^^…$$`) and anchor alternations as a whole
- [x] Remove dead `latinFormat` field from `CountryAddressConfig`

### 4.2 Single source of truth (P1 — shipped)

- [x] Extract pure `validateAddressConfig` / `formatAddress` into `@addresskit/core`
- [x] `@addresskit/validation` delegates to `validateAddressConfig` (no duplicate rules)
- [x] Export pure utilities from core (`validateAddressConfig`, `formatAddress`, `toPostalCodeRegex`, `resolveAdministrativeArea`)

### 4.3 Cheap country list & name resolution (P1 — shipped)

- [x] Generate a bundled `COUNTRIES` index (`{ code, name }`) in `@addresskit/data`
- [x] `getCountries()` no longer loads all 256 metadata files; libaddressinput provider uses the index
- [x] Add `getCountryName(code)` and `getStateName(country, code)` helpers
- [x] Update generator script to emit `countries.ts`

### 4.4 React ergonomics (P2)

- [x] `useAddressEngine()` memoizes one engine per provider so the metadata cache survives across renders
- [ ] Debounce `useAddressValidation` and stabilize its effect deps (avoid revalidating on every render)
- [ ] Surface `isLoading` / `error` state from `<Address>` and the hooks (schema fetch + provider rejection)
- [ ] Add an error boundary / fallback when a provider fails to load a country

### 4.5 Theming & headless polish (P2)

- [ ] Add `className` / `style` / `classNames` passthrough to `DefaultInput` / `DefaultSelect`
- [ ] Provide an unstyled (truly headless) render mode / primitives
- [ ] Document the component slot pattern for design-system integration

### 4.6 Complete or remove the city contract (P2)

- [ ] Implement city autocomplete end-to-end (`combobox` field type + `getCities`), or
- [ ] Formally remove `combobox` / `getCities` from the public types until a data source exists

### 4.7 Data quality (P2/P3)

- [ ] Normalize country/subregion name casing (libaddressinput names are UPPER-CASE; dr5hn is title-case)
- [ ] Decide a single canonical display casing and apply consistently across providers

### 4.8 Tests & tooling (P2)

- [x] Tests for postal-regex normalization, format state-name resolution, cold-cache `format()`, and the data name APIs
- [ ] Fix `pnpm lint` scope (currently lints `dist`/generated files → tens of thousands of false errors)
- [ ] Add `<Address>` behavior tests (country-switch cascade, debounced validation, loading states)
- [ ] Add a typecheck (`tsc --noEmit`) step to CI for every package and example

---

## Future / Backlog

- [ ] Multiple address formats (shipping, billing, business)
- [ ] Server-side rendering benchmarks
- [ ] Bundle size CI checks
- [ ] Accessibility CI automation (axe-core)
- [ ] Visual regression testing
- [ ] i18n for all countries
- [ ] Electron support
- [ ] SolidJS adapter
- [ ] Qwik adapter
- [ ] Preact adapter
- [ ] Lit adapter
- [ ] Visual form builder (drag-and-drop)
- [ ] Address verification API integration (Lob, Smarty, etc.)
- [ ] AI-powered address completion

---

## How to Use This Plan

- Checkboxes track completion status. Mark `[x]` as items are completed.
- Phases build on each other; complete Phase 1 before starting Phase 2.
- Items within a phase can be worked on in parallel where dependencies allow.
- Package implementations include tests and documentation.
