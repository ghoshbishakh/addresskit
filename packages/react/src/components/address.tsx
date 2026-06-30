import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createEngine } from "@addresskit/core";
import type { Address, AddressProvider, Field, FieldId } from "@addresskit/core";
import { useAddressProvider } from "../context";
import { DefaultInput, DefaultSelect } from "./fields";
import type { FieldComponents } from "./fields";

interface AddressProps {
  value: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  allowedCountries?: string[];
  components?: FieldComponents;
  provider?: AddressProvider;
}

export function Address({
  value,
  onChange,
  allowedCountries,
  components,
  provider: explicitProvider,
}: AddressProps) {
  const ctxProvider = useAddressProvider();
  const provider = explicitProvider ?? ctxProvider;
  const engine = useMemo(() => createEngine(provider), [provider]);
  const prevCountry = useRef<string | null>(value.country ?? null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  const Input = components?.Input ?? DefaultInput;
  const Select = components?.Select ?? DefaultSelect;

  useEffect(() => {
    provider.getCountries().then((all) => {
      if (allowedCountries) {
        setCountries(all.filter((c) => allowedCountries.includes(c.code)));
      } else {
        setCountries(all);
      }
    });
  }, [provider, allowedCountries]);

  useEffect(() => {
    if (!value.country) return;

    const newCountry = value.country;
    const oldCountry = prevCountry.current;

    if (oldCountry && oldCountry !== newCountry) {
      const cleaned = engine.clearInvalidValues(value as Address, oldCountry, newCountry);
      onChange(cleaned);
    }

    prevCountry.current = newCountry;

    engine.getSchema(newCountry).then((schema) => {
      setFields(schema.fields);
    });
  }, [value.country]);

  const handleFieldChange = useCallback(
    (id: FieldId, fieldValue: string) => {
      const current = valueRef.current;
      const updated = { ...current, [id]: fieldValue || undefined };

      if (id === "administrativeArea") {
        const cleaned = engine.clearState(updated as Address);
        onChange({ ...cleaned, administrativeArea: fieldValue || undefined });
        return;
      }

      onChange(updated);
    },
    [onChange, engine],
  );

  useEffect(() => {
    if (!value.country || !value.line1) {
      setErrors({});
      return;
    }

    const timer = setTimeout(async () => {
      const result = await engine.validate(value as Address);
      const errorMap: Record<string, string> = {};
      for (const err of result.errors) {
        errorMap[err.field] = err.message;
      }
      setErrors(errorMap);
    }, 300);

    return () => clearTimeout(timer);
  }, [value.country, value.line1, value.locality, value.administrativeArea, value.postalCode, engine]);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="address-field-country"
          style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
        >
          Country
        </label>
        <select
          id="address-field-country"
          value={value.country ?? ""}
          onChange={(e) => onChange({ country: e.target.value })}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box",
            background: "#fff",
          }}
        >
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {fields.map((field) => {
        const val = value[field.id as keyof Address] ?? "";
        const err = errors[field.id];

        if (field.type === "select" && field.options) {
          return (
            <Select
              key={field.id}
              field={field}
              value={val}
              error={err}
              onChange={handleFieldChange}
            />
          );
        }

        return (
          <Input
            key={field.id}
            field={field}
            value={val}
            error={err}
            onChange={handleFieldChange}
          />
        );
      })}
    </div>
  );
}
