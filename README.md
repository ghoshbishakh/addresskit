# AddressKit

> Open-source, headless address components for React.

Dynamically render country-specific address forms with validation, state/city cascading, and pluggable data providers -- no API keys required.

---

## Features

- **Country-specific forms** -- field labels, ordering, and required fields adapt to each of 256 countries/territories (from Google's libaddressinput data)
- **Country-aware validation** -- required fields, postal code regex, and valid state/province checks adapt automatically to the selected country
- **Dynamic field schemas** -- `getSchema(country)` tells your UI which fields to show and which render as dropdowns vs. text inputs
- **State/province dropdowns** -- bundled subregion lists with codes *and* display names for 43 countries
- **Drop-in React component** -- `<Address>` handles country switching, field re-rendering, debounced validation, and invalid-value cleanup
- **Pluggable data providers** -- swap libaddressinput, dr5hn, or your own behind one `AddressProvider` interface
- **Address formatting** -- `format()` produces a correctly ordered postal string per country's format rules
- **Lazy-loaded & tree-shakeable** -- each country is a separately imported JSON, so apps only ship data for countries actually used
- **Framework-agnostic core** -- validation/schema/format logic lives in `@addresskit/core` with no React dependency
- **Headless architecture** -- use the hooks or bring your own UI components
- **SSR compatible** -- works with Next.js App Router, Pages Router, Vite, Remix
- **Offline capable, no mandatory API keys** -- bundled metadata works without network or external services
- **TypeScript** -- full type safety

---

## Packages

| Package | Description |
|---|---|
| `@addresskit/core` | Address engine, metadata parsing, validation, formatting, provider interfaces |
| `@addresskit/react` | React hooks, components, context, headless renderer |
| `@addresskit/react-hook-form` | React Hook Form integration component |
| `@addresskit/data` | Bundled country metadata (lazy-loads per country) |
| `@addresskit/providers-libaddressinput` | Google libaddressinput metadata provider |
| `@addresskit/providers-dr5hn` | Countries/States/Cities database provider (250 countries) |
| `@addresskit/validation` | Validation rules, postal code regex, custom validators |

---

## Quick Start

```bash
npm install @addresskit/core @addresskit/react @addresskit/providers-libaddressinput
```

```tsx
import { Address, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

function MyForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <AddressProviderContext.Provider value={provider}>
      <Address value={address} onChange={setAddress} />
    </AddressProviderContext.Provider>
  );
}
```

### Props

| Prop | Type | Description |
|---|---|---|
| `value` | `Partial<Address>` | Current address values |
| `onChange` | `(address: Partial<Address>) => void` | Called on every field change |
| `allowedCountries` | `string[]` | Restrict country dropdown to specific codes |
| `components` | `{ Input?, Select? }` | Custom component overrides |
| `provider` | `AddressProvider` | Explicit provider (overrides context) |

---

## Next.js

The `<Address>` component uses `"use client"`. Data loads synchronously on first render -- no useEffect required.

```tsx
"use client";

import { Address, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

export default function AddressForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <AddressProviderContext.Provider value={provider}>
      <Address value={address} onChange={setAddress} />
    </AddressProviderContext.Provider>
  );
}
```

Add workspace packages to `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@addresskit/core",
    "@addresskit/data",
    "@addresskit/react",
    "@addresskit/providers-libaddressinput",
    "@addresskit/providers-dr5hn",
  ],
};

export default nextConfig;
```

---

## Vite

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>
);
```

```tsx
// app.tsx
import { useState } from "react";
import { Address, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

export default function App() {
  const [value, setValue] = useState({ country: "US" });

  return (
    <AddressProviderContext.Provider value={provider}>
      <Address value={value} onChange={setValue} />
    </AddressProviderContext.Provider>
  );
}
```

---

## React Hook Form

```bash
npm install @addresskit/react-hook-form react-hook-form
```

```tsx
import { useForm } from "react-hook-form";
import { AddressProviderContext } from "@addresskit/react";
import { AddressController } from "@addresskit/react-hook-form";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import type { Address } from "@addresskit/core";

const provider = createLibaddressinputProvider();

export default function RHFExample() {
  const { control, handleSubmit } = useForm<{ address: Partial<Address> }>({
    defaultValues: { address: { country: "US" } },
  });

  return (
    <AddressProviderContext.Provider value={provider}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <AddressController name="address" control={control} />
        <button type="submit">Submit</button>
      </form>
    </AddressProviderContext.Provider>
  );
}
```

The `AddressController` accepts RHF `rules` for validation:

```tsx
<AddressController
  name="address"
  control={control}
  rules={{
    validate: {
      requiredFields: (value) => {
        const addr = value as Partial<Address>;
        if (addr.country && !addr.line1) return "Street address is required";
        return true;
      },
    },
  }}
/>
```

---

## Headless API

Skip the `<Address>` component and use hooks directly for custom rendering:

```tsx
import { createEngine } from "@addresskit/core";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import { useState, useEffect } from "react";

const provider = createLibaddressinputProvider();
const engine = createEngine(provider);

function CustomForm() {
  const [country, setCountry] = useState("US");
  const [fields, setFields] = useState([]);

  useEffect(() => {
    engine.getSchema(country).then((schema) => setFields(schema.fields));
  }, [country]);

  return (
    <form>
      {fields.map((field) => (
        <input key={field.id} placeholder={field.placeholder} />
      ))}
    </form>
  );
}
```

Available hooks from `@addresskit/react`:

| Hook | Returns |
|---|---|
| `useAddressSchema(country)` | `{ fields, format, country }` |
| `useAddressValidation(address)` | `{ valid, errors }` |
| `useAddressFormat(address)` | Formatted string |
| `useAddressEngine()` | `AddressEngine` instance |

---

## Providers

### libaddressinput (metadata)

Provides address format, field labels, ordering, required fields, and postal code regex for 256 countries/territories, plus state/province lists (with codes and display names) for 43 of them.

```tsx
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
```

### dr5hn (countries/states/cities)

Provides 250 countries and per-country state/region lists. Delegates metadata to `@addresskit/data` with fallback default config.

```tsx
import { createDr5hnProvider } from "@addresskit/providers-dr5hn";
```

---

## State/City Cascading

The `<Address>` component automatically clears dependent fields when country or state changes:

- **Country change** -- clears locality, administrativeArea, and postalCode
- **State change** -- clears locality and postalCode

The dr5hn provider supplies state lists for 229 countries. Cities can be added with a custom provider.

---

## Custom Components

Pass custom Input and Select components via the `components` prop:

```tsx
<Address
  value={value}
  onChange={setValue}
  components={{
    Input: ({ field, value, error, onChange }) => (
      <div>
        <label>{field.label}</label>
        <input
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          aria-invalid={!!error}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    ),
    Select: ({ field, value, error, onChange }) => (
      <div>
        <label>{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          aria-invalid={!!error}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    ),
  }}
/>
```

---

## Custom Provider

Implement the `AddressProvider` interface to supply your own data:

```tsx
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";

const myProvider: AddressProvider = {
  async getCountries() { return [{ code: "US", name: "United States" }]; },
  async getStates(country) { return []; },
  async getCities(country, state) { return []; },
  async getMetadata(country) { /* return CountryAddressConfig */ },
};
```

---

## Development

```
pnpm install
pnpm build
pnpm test
```

See [plan.md](./plan.md) for the development roadmap.

---

## License

MIT
