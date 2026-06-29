# AddressKit

> Open-source, headless address components for React and other frameworks.

Dynamically render country-specific address forms with validation, state/city cascading, and pluggable data providers  -  no API keys required.

---

## Features

- **Country-specific forms**  -  field labels, ordering, and required fields adapt to each country
- **Postal code validation**  -  regex-based validation per country
- **Country → State → City cascading**  -  automatic, with lazy-loaded data
- **Headless architecture**  -  use the hooks or bring your own UI components
- **Framework agnostic**  -  React-first with adapters for Vue, Svelte, Angular, and React Native. First-class Next.js support.
- **Offline capable**  -  works offline by default with bundled metadata
- **No mandatory API keys**  -  all core features work without external services
- **Optional autocomplete**  -  pluggable providers for Google Places, Mapbox, HERE
- **Tree-shakeable**  -  import only what you need
- **SSR compatible**  -  works with Next.js (App Router + Pages Router), Remix, and other SSR frameworks
- **TypeScript**  -  full type safety

---

## Packages

| Package | Description |
|---|---|
| `@addresskit/core` | Address engine, metadata parsing, validation, formatting, provider interfaces |
| `@addresskit/react` | React hooks, components, context, headless renderer |
| `@addresskit/data` | Bundled country metadata, states, cities (lazy-loads) |
| `@addresskit/providers/libaddressinput` | Google libaddressinput metadata provider |
| `@addresskit/providers/dr5hn` | Countries/States/Cities database provider |
| `@addresskit/providers/google` | Google Places autocomplete (optional) |
| `@addresskit/providers/mapbox` | Mapbox Search autocomplete (optional) |
| `@addresskit/providers/here` | HERE Search autocomplete (optional) |
| `@addresskit/validation` | Validation rules, postal code regex, custom validators |

---

## Quick Start

```tsx
import { Address } from "@addresskit/react";

function MyForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <Address
      value={address}
      onChange={setAddress}
      allowedCountries={["US", "CA", "GB", "IN"]}
    />
  );
}
```

### Next.js (App Router)

```tsx
"use client";

import { Address } from "@addresskit/react";

export default function AddressForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <Address
      value={address}
      onChange={setAddress}
    />
  );
}
```

Data loads synchronously on first render. No useEffect required.

### Headless Mode

```tsx
import { useAddressSchema } from "@addresskit/react";

function CustomForm() {
  const schema = useAddressSchema("US");

  return (
    <form>
      {schema.fields.map((field) => (
        <MyCustomField key={field.id} field={field} />
      ))}
    </form>
  );
}
```

---

## Development

See [plan.md](./plan.md) for the full development roadmap.

```
pnpm install
pnpm build
pnpm test
```

---

## License

MIT
