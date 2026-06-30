# AddressKit Architecture

> Headless, offline, no-API-key address forms and validation for 256 countries.

This document summarizes how the packages fit together and where the
responsibilities live. Keep it updated when the public surface or data flow
changes.

---

## Layered design

Data flows in one direction; `AddressProvider` is the seam between bundled data
and the engine, so any data source can be swapped in.

```
@addresskit/data ─────────────► 256 lazy-loaded country JSONs
  loadMetadata(code)             + bundled COUNTRIES index (code+name)
  getSupportedCountries()        + getCountries / getCountryName / getStateName
        ▲
        │ delegates
providers/{libaddressinput, dr5hn} ─► implement AddressProvider
  getCountries · getStates · getCities · getMetadata
        ▲
        │ injected
@addresskit/core ─────────────► createEngine(provider)
  pure: validateAddressConfig, formatAddress, buildSchema, toPostalCodeRegex
  engine: getSchema · validate · format · clearInvalidValues · clearState
        ▲
        │ consumes
@addresskit/react ────────────► <Address>, hooks, context
@addresskit/react-hook-form ──► <AddressController>
@addresskit/validation ───────► createValidator (wraps core's validateAddressConfig)
```

---

## Packages

| Package | Responsibility |
|---|---|
| `@addresskit/core` | The contract (`types.ts`) plus pure logic: schema building, validation, formatting. No dependencies. |
| `@addresskit/data` | 256 country metadata JSONs (lazy, one dynamic import each) + a bundled lightweight country index. |
| `@addresskit/providers-libaddressinput` | `AddressProvider` over `@addresskit/data` (Google libaddressinput-derived metadata). |
| `@addresskit/providers-dr5hn` | `AddressProvider` over the dr5hn countries/states dataset; delegates metadata to `@addresskit/data`. |
| `@addresskit/react` | `<Address>` component, headless hooks, and provider context. |
| `@addresskit/react-hook-form` | `<AddressController>` binding `<Address>` to React Hook Form. |
| `@addresskit/validation` | Standalone provider-bound validator; rules live in core. |

---

## Core responsibilities

`@addresskit/core` is split into **pure functions** (no I/O, easy to test and
reuse) and a thin **engine** that adds provider-backed metadata loading + caching.

- `validate.ts`
  - `validateAddressConfig(config, address)` — required fields, postal-code
    pattern, and subregion membership. **Single source of truth** for validation
    (the `validation` package and the engine both call it).
  - `toPostalCodeRegex(pattern)` — normalizes stored patterns (which may or may
    not already be `^…$`-anchored) into one `^(?:…)$` regex, avoiding the former
    double-anchoring bug.
- `format.ts`
  - `formatAddress(config, address)` — renders the country format template;
    resolves the `administrativeArea` **code → display name** (e.g. `CA` →
    `California`).
  - `resolveAdministrativeArea(config, value)` — the code→name lookup, exported
    for reuse.
- `schema.ts` — `buildSchema(config)` derives the field list (which fields show,
  and which render as `select` vs `text`) from the format template + metadata.
- `engine.ts` — `createEngine(provider)` wraps the pure functions with
  on-demand metadata loading and a per-engine cache. `validate`, `format`, and
  `getSchema` are async and load metadata themselves, so callers never need to
  prime the cache first.

---

## Data package

- Per-country metadata lives in `src/data/<CODE>.json` (uppercase ISO codes) and
  is loaded lazily via dynamic `import()` in the generated `src/loader.ts`. Only
  countries actually used are shipped to the client.
- `src/countries.ts` is a generated, **bundled** index of `{ code, name }` so a
  country selector can be built without loading all 256 metadata files.
- Both generated files come from
  `scripts/generate-from-libaddressinput.mjs`. Do not hand-edit
  `loader.ts`/`countries.ts`.
- Public API: `loadMetadata`, `getSupportedCountries`, `getCountries`,
  `getCountryName`, `getStateName`, `COUNTRIES`.
- Build note: `tsup` uses the `copy` loader for `.json`, so static JSON imports
  return a path, not parsed data — that's why the country index is emitted as a
  `.ts` module rather than imported from JSON.

---

## React layer

- `useAddressEngine()` memoizes a single engine per provider, so the engine's
  metadata cache survives across renders. `useAddressSchema`, `useAddressValidation`,
  and `useAddressFormat` all build on it.
- `<Address>` owns country switching, schema-driven field rendering, debounced
  validation, and dependent-field clearing on country/state change. Field UI is
  overridable via the `components` prop (`Input`/`Select`).

---

## Known gaps / future work

- **City autocomplete** (`combobox` field type, `getCities`) is part of the
  provider contract but returns empty everywhere — not yet implemented.
- **Country name casing**: libaddressinput-derived names are upper-cased in
  source (e.g. `UNITED STATES`); the dr5hn dataset has title-cased names.
- **Loading/error states** are not yet surfaced from `<Address>` or the hooks.
- **Default components are styled** with inline styles and lack
  `className`/`style` passthrough for theming.
