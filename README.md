# AddressKit

> Frontend and backend JavaScript library for dynamic address forms and address validation.

Render country-specific address forms in the frontend and validate, normalize, and format addresses in the backend. Works offline for 256 countries with zero external API keys.

---

## Features

- **Dynamic frontend forms**: field labels, ordering, and required fields adapt to each of 256 countries and territories.
- **Backend address validation**: validate required fields, postal code regex, and valid state or province names or codes in Node.js, Deno, Bun, or edge runtimes.
- **Address normalization**: trim inputs, convert country codes and state codes to uppercase, and canonicalize subregion names.
- **Address formatting**: produce multi-line postal strings or single-line address strings per country rules.
- **Drop-in React component**: `<Address>` handles country switching, dynamic schema generation, state cascading, and debounced validation.
- **Headless React hook**: `useAddressForm` provides full state, schema, cascading, and validation logic for custom form UIs.
- **React Hook Form integration**: `<AddressController>` and `addressValidationRule` for direct React Hook Form integration.
- **Pluggable data providers**: swap libaddressinput, dr5hn, or custom data sources behind the `AddressProvider` interface.
- **Zero browser dependencies in core**: core and validation packages run anywhere JavaScript runs.
- **Lazy-loaded and tree-shakeable**: each country loads on demand.
- **TypeScript**: full type safety with strict types.

---

## Packages

| Package | Description |
|---|---|
| `@addresskit/core` | Address engine, metadata parsing, validation, formatting, normalization, and provider interfaces |
| `@addresskit/validation` | Backend and standalone address validation, normalization, and formatting |
| `@addresskit/react` | Dynamic `<Address>` component, headless hooks (`useAddressForm`, `useCountries`), and context |
| `@addresskit/react-hook-form` | `<AddressController>` and `addressValidationRule` for React Hook Form |
| `@addresskit/data` | Bundled country metadata (lazy-loads per country) |
| `@addresskit/providers-libaddressinput` | Google libaddressinput metadata provider |
| `@addresskit/providers-dr5hn` | Countries, states, and cities database provider |

---

## Backend Usage

Validate, normalize, and format addresses in backend services (Express, Fastify, Next.js server actions, Hono, NestJS):

```bash
npm install @addresskit/validation @addresskit/core
```

```ts
import { validateAddress, normalizeAddress, formatAddress } from "@addresskit/validation";

const input = {
  country: "us",
  line1: "  1600 Amphitheatre Pkwy  ",
  locality: "  Mountain View  ",
  administrativeArea: "California",
  postalCode: "  94043  ",
};

// 1. Normalize address (trim, uppercase codes, canonicalize subregions)
const normalized = await normalizeAddress(input);
// { country: "US", line1: "1600 Amphitheatre Pkwy", locality: "Mountain View", administrativeArea: "CA", postalCode: "94043" }

// 2. Validate address
const validation = await validateAddress(normalized);
if (!validation.valid) {
  console.error("Validation failed:", validation.errors);
}

// 3. Format address for display or labels
const singleLine = await formatAddress(normalized, { singleLine: true, includeCountry: true });
// "1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States"
```

### Custom Backend Validators

Add custom validation rules (such as PO Box restrictions or database checks):

```ts
import { validateAddress } from "@addresskit/validation";

const result = await validateAddress(address, {
  customValidators: [
    (addr) => {
      if (addr.line1.toLowerCase().includes("po box")) {
        return [{ field: "line1", message: "PO Boxes are not accepted" }];
      }
      return [];
    },
  ],
});
```

---

## Frontend Usage

### Drop-in Component

```bash
npm install @addresskit/react @addresskit/providers-libaddressinput
```

```tsx
import { useState } from "react";
import { Address, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

export function MyAddressForm() {
  const [address, setAddress] = useState({ country: "US" });

  return (
    <AddressProviderContext.Provider value={provider}>
      <Address value={address} onChange={setAddress} />
    </AddressProviderContext.Provider>
  );
}
```

### Headless Hook (`useAddressForm`)

For full design freedom, build custom UI forms with `useAddressForm`:

```tsx
import { useAddressForm, AddressProviderContext } from "@addresskit/react";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";

const provider = createLibaddressinputProvider();

function HeadlessAddressForm() {
  const {
    address,
    setCountry,
    setFieldValue,
    fields,
    errors,
    countries,
    isValid,
  } = useAddressForm({
    initialAddress: { country: "US" },
  });

  return (
    <form>
      <label htmlFor="country-select">Country</label>
      <select
        id="country-select"
        value={address.country ?? ""}
        onChange={(e) => setCountry(e.target.value)}
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <input
            id={field.id}
            value={address[field.id] ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
          />
          {errors[field.id] && <span>{errors[field.id]}</span>}
        </div>
      ))}
    </form>
  );
}
```

---

## React Hook Form

```bash
npm install @addresskit/react-hook-form @addresskit/react @addresskit/providers-libaddressinput react-hook-form
```

```tsx
import { useForm } from "react-hook-form";
import { AddressProviderContext } from "@addresskit/react";
import { AddressController, addressValidationRule } from "@addresskit/react-hook-form";
import { createLibaddressinputProvider } from "@addresskit/providers-libaddressinput";
import type { Address } from "@addresskit/core";

const provider = createLibaddressinputProvider();

export function FormWithRHF() {
  const { control, handleSubmit } = useForm<{ address: Partial<Address> }>({
    defaultValues: { address: { country: "US" } },
  });

  return (
    <AddressProviderContext.Provider value={provider}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <AddressController
          name="address"
          control={control}
          rules={{ validate: addressValidationRule(provider) }}
        />
        <button type="submit">Submit</button>
      </form>
    </AddressProviderContext.Provider>
  );
}
```

---

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

---

## License

MIT
