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
- [ ] Provide controlled integration example
- [ ] Test with RHF validation modes

### 2.3 Examples  -  Next.js

- [x] Create `packages/examples/nextjs/`
- [x] Basic address form example
- [ ] Country-restricted form example
- [ ] Headless rendering example
- [ ] RHF integration example

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

- [ ] Write React integration guide
- [ ] Write headless usage guide
- [ ] Write Next.js guide
- [ ] Write Vite guide
- [ ] Write Remix guide
- [ ] Write React Hook Form guide

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

## Phase 3: Autocomplete, Localization & Performance

**Goal:** Optional autocomplete providers, localization support, and performance tuning.

### 3.1 Autocomplete Provider Interface

- [ ] Define `AutocompleteProvider` interface
- [ ] Define `AutocompleteResult` type
- [ ] Build autocomplete adapter pattern (pluggable, zero dependencies)

### 3.2 Google Places Autocomplete

- [ ] Create `@addresskit/providers/google` package
- [ ] Implement `AutocompleteProvider` for Google Places API
- [ ] Expose as optional import (not bundled by default)
- [ ] Add autocomplete prop to `<Address>` component

### 3.3 Mapbox Search Autocomplete

- [ ] Create `@addresskit/providers/mapbox` package
- [ ] Implement `AutocompleteProvider` for Mapbox Search API
- [ ] Expose as optional import

### 3.4 HERE Search Autocomplete

- [ ] Create `@addresskit/providers/here` package
- [ ] Implement `AutocompleteProvider` for HERE Search API
- [ ] Expose as optional import

### 3.5 Autocomplete Integration in React

- [ ] Wire autocomplete into `<Address>` component
- [ ] Debounce search input
- [ ] Display autocomplete suggestions dropdown
- [ ] Handle selection → populate address fields
- [ ] Handle no-results and error states

### 3.6 Localization / Internationalization

- [ ] Define i18n interface
- [ ] Build translation map for field labels
- [ ] Support `locale` prop on `<Address>` component
- [ ] Provide default English translations
- [ ] Allow custom translation overrides

### 3.7 Performance Optimization

- [ ] Lazy-load metadata per country (never bundle all countries)
- [ ] Lazy-load states per country (when dr5hn provider is used)
- [ ] Lazy-load cities per state/country (when dr5hn provider is used)
- [ ] Implement tree-shaking-friendly imports (`import "@addresskit/data/US"`)
- [ ] Memoize schema generation
- [ ] Memoize validation results
- [ ] Virtualize large city dropdowns (10k+ cities)
- [ ] Async search for city combobox
- [ ] Audit bundle size

### 3.8 Accessibility

- [ ] Ensure all default components have proper ARIA attributes
- [ ] Keyboard navigation for Select and Combobox
- [ ] Screen reader announcements for validation errors
- [ ] Focus management on country/state change
- [ ] Accessible autocomplete dropdown

### 3.9 Testing  -  Phase 3

- [ ] Test autocomplete provider adapters
- [ ] Test autocomplete integration in React
- [ ] Test localization
- [ ] Performance benchmarks

---

## Phase 4: Enterprise, Frameworks & Polish

**Goal:** Additional framework adapters, mature provider APIs, and documentation site.

### 4.1 Shadcn/ui Example

- [ ] Create `packages/examples/shadcn/`
- [ ] Build example with shadcn/ui styling
- [ ] Demonstrate component slot pattern

### 4.2 UI Framework Integration Guides

- [ ] Mantine integration example
- [ ] MUI integration example
- [ ] Chakra UI integration example
- [ ] Tailwind CSS styling guide

### 4.3 Vue Adapter

- [ ] Create `@addresskit/vue` package
- [ ] Build Vue composables (`useAddressSchema`)
- [ ] Build Vue component (`<Address>`)
- [ ] Vue example project
- [ ] Vue documentation

### 4.4 Svelte Adapter

- [ ] Create `@addresskit/svelte` package
- [ ] Build Svelte stores/stores
- [ ] Build Svelte component
- [ ] Svelte example project

### 4.5 Angular Adapter

- [ ] Create `@addresskit/angular` package
- [ ] Build Angular service and component
- [ ] Angular example project

### 4.6 React Native Adapter

- [ ] Create `@addresskit/react-native` package
- [ ] Build React Native components
- [ ] Handle native platform differences

### 4.7 Enterprise Provider APIs

- [ ] Hosted metadata CDN (optional)
- [ ] Server-side validation package (`@addresskit/validation-server`)
- [ ] Address normalization service interface
- [ ] Reverse geocoding provider interface

### 4.8 Advanced Features

- [ ] Zod schema generation from address schema
- [ ] JSON Schema generation
- [ ] Address diffing utility
- [ ] Address normalization
- [ ] Custom field injection API
- [ ] Custom validation rules API
- [ ] Country-specific tax identifier fields
- [ ] Phone number field integration
- [ ] Postal code lookup (autofill locality from postal code)

### 4.9 Documentation Site

- [ ] Build interactive playground
- [ ] Country selector + schema viewer
- [ ] Validation result viewer
- [ ] Live code editor for examples
- [ ] API reference docs
- [ ] Migration guide
- [ ] Contribution guide

### 4.10 E2E Testing

- [ ] Set up Playwright
- [ ] E2E tests for core user flows
- [ ] Cross-browser testing
- [ ] E2E for autocomplete flows

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
