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

- [ ] Define core TypeScript interfaces (`Address`, `Field`, `Schema`, `ValidationResult`)
- [ ] Define `AddressProvider` interface (`getCountries`, `getStates`, `getCities`, `getMetadata`)
- [ ] Build `AddressEngine` class:
  - [ ] `getSchema(country)`  -  generate form schema from metadata
  - [ ] `validate(address)`  -  validate required fields, postal code regex, administrative area
  - [ ] `format(address)`  -  format address per country template
  - [ ] `clearInvalidValues(address, prevCountry, newCountry)`  -  cascade clear on country change
- [ ] Implement metadata parsing for libaddressinput format
- [ ] Export `@addresskit/core` package via tsup (ESM + CJS + Types)

### 1.3 @addresskit/data  -  Bundled Data

- [ ] Add libaddressinput metadata as a data source
- [ ] Bundle country metadata JSON (field order, labels, required fields, postal regex)
- [ ] Lazy-load per-country data
- [ ] Export `@addresskit/data` package via tsup

### 1.4 @addresskit/providers/libaddressinput  -  Metadata Provider

- [ ] Implement `AddressProvider` using libaddressinput metadata
- [ ] Parse and expose country-specific field ordering, labels, required fields, postal regex

### 1.5 @addresskit/providers/dr5hn  -  Countries/States/Cities Provider

- [ ] Bundle JSON from dr5hn Countries States Cities database
- [ ] Implement `AddressProvider` for countries, states, and cities
- [ ] Support local JSON loading
- [ ] Support remote JSON loading (optional)
- [ ] Support custom provider injection
- [ ] Lazy-load cities on demand

### 1.6 @addresskit/react  -  React Package

- [ ] Build `useAddressSchema(country)` hook (headless schema access)
- [ ] Build `useAddressProvider()` context hook
- [ ] Create `AddressProvider` context wrapper
- [ ] Build high-level `<Address>` component:
  - [ ] Controlled `value`/`onChange` API
  - [ ] `allowedCountries` prop for country restriction
  - [ ] `components` prop for custom Input/Select/Combobox overrides
  - [ ] Auto-generated form fields from schema
- [ ] Implement default Input, Select, ComboBox components
- [ ] Handle country change cascade (schema regeneration, value clearing, revalidation)
- [ ] Handle state change cascade (city reload, value clearing)
- [ ] SSR-safe initial render (no useEffect for first data load)
- [ ] Test with Next.js App Router and Pages Router
- [ ] Export `@addresskit/react` package via tsup

### 1.7 Validation Package

- [ ] Build postal code validation per country regex from metadata
- [ ] Build required field validation
- [ ] Build administrative area validity check
- [ ] Support custom validators injection
- [ ] Return structured `ValidationResult` with per-field errors

### 1.8 Testing  -  Phase 1

- [ ] Unit tests for metadata parsing
- [ ] Unit tests for schema generation
- [ ] Unit tests for validation (required fields, postal codes)
- [ ] Unit tests for formatting
- [ ] Unit tests for provider implementations
- [ ] Integration tests for React rendering
- [ ] Integration tests for country switching
- [ ] Integration tests for state switching
- [ ] Integration tests for city switching

---

## Phase 2: Headless API & Integrations

**Goal:** Expose headless rendering, integrate with React Hook Form, and provide Next.js examples.

### 2.1 Headless API

- [ ] Finalize `useAddressSchema` hook API
- [ ] Expose raw `Field` array for custom rendering
- [ ] Document headless usage pattern
- [ ] Build headless example in repo

### 2.2 React Hook Form Integration

- [ ] Build `<AddressController>`  -  RHF-compatible wrapper
- [ ] Provide controlled integration example
- [ ] Test with RHF validation modes

### 2.3 Examples  -  Next.js

- [ ] Create `packages/examples/nextjs/`
- [ ] Basic address form example
- [ ] Country-restricted form example
- [ ] Headless rendering example
- [ ] RHF integration example

### 2.4 Examples  -  Vite

- [ ] Create `packages/examples/vite/`
- [ ] Basic address form example

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
- [ ] Lazy-load states per country
- [ ] Lazy-load cities per state/country
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
