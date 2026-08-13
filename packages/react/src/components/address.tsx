import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CSSProperties } from "react";
import { createEngine } from "@addresskit/core";
import type {
  Address as AddressType,
  AddressProvider,
  Field,
  FieldId,
  ValidationResult,
} from "@addresskit/core";
import { useAddressProvider } from "../context";
import { DefaultInput, DefaultSelect } from "./fields";
import type {
  AddressClassNames,
  AddressStyles,
  FieldComponents,
} from "./fields";
import {
  AddressRoot,
  AddressCountry,
  AddressFields,
  AddressField,
  AddressLabel,
  AddressInput,
  AddressSelect,
  AddressError,
} from "./primitives";

interface AddressProps {
  value: Partial<AddressType>;
  onChange: (address: Partial<AddressType>) => void;
  allowedCountries?: string[];
  components?: FieldComponents;
  provider?: AddressProvider;
  disabled?: boolean;
  readOnly?: boolean;
  showErrors?: boolean;
  onValidationChange?: (result: ValidationResult) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: AddressClassNames;
  styles?: AddressStyles;
  fieldOverrides?: Partial<Record<FieldId, Partial<Field>>>;
}

function AddressComponent({
  value,
  onChange,
  allowedCountries,
  components,
  provider: explicitProvider,
  disabled,
  readOnly,
  showErrors = true,
  onValidationChange,
  className,
  style,
  classNames,
  styles,
  fieldOverrides,
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

  const allowedKey = allowedCountries?.join(",");

  useEffect(() => {
    provider.getCountries().then((all) => {
      if (allowedCountries && allowedCountries.length > 0) {
        setCountries(all.filter((c) => allowedCountries.includes(c.code)));
      } else {
        setCountries(all);
      }
    });
  }, [provider, allowedKey]);

  useEffect(() => {
    if (!value.country) {
      setFields([]);
      return;
    }

    prevCountry.current = value.country;

    engine.getSchema(value.country).then((schema) => {
      let schemaFields = schema.fields;
      if (fieldOverrides) {
        schemaFields = schemaFields.map((f) => {
          const override = fieldOverrides[f.id];
          return override ? { ...f, ...override } : f;
        });
      }
      setFields(schemaFields);
    });
  }, [value.country, engine, fieldOverrides]);

  const handleCountryChange = useCallback(
    (newCountry: string) => {
      const oldCountry = prevCountry.current;
      prevCountry.current = newCountry;

      const current = valueRef.current;
      const cleaned = oldCountry
        ? engine.clearInvalidValues(current as AddressType, oldCountry, newCountry)
        : { ...current, country: newCountry };

      onChange(cleaned);
    },
    [engine, onChange],
  );

  const handleFieldChange = useCallback(
    (id: FieldId, fieldValue: string) => {
      const current = valueRef.current;
      const updated = { ...current, [id]: fieldValue || undefined };

      if (id === "administrativeArea") {
        const cleaned = engine.clearState(updated as AddressType);
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
      const result = await engine.validate(value as AddressType);
      const errorMap: Record<string, string> = {};
      for (const err of result.errors) {
        errorMap[err.field] = err.message;
      }
      setErrors(errorMap);
      if (onValidationChange) {
        onValidationChange(result);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    value.country,
    value.line1,
    value.locality,
    value.administrativeArea,
    value.postalCode,
    engine,
    onValidationChange,
  ]);

  return (
    <div
      className={className ?? classNames?.root}
      style={{ ...styles?.root, ...style }}
    >
      <div
        className={classNames?.field}
        style={{ marginBottom: 12, ...styles?.field }}
      >
        <label
          htmlFor="address-field-country"
          className={classNames?.label}
          style={{ display: "block", marginBottom: 4, fontWeight: 500, ...styles?.label }}
        >
          Country
        </label>
        <select
          id="address-field-country"
          value={value.country ?? ""}
          disabled={disabled || readOnly}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={classNames?.select}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box",
            background: "#fff",
            opacity: disabled ? 0.6 : 1,
            ...styles?.select,
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
        const val = value[field.id as keyof AddressType] ?? "";
        const err = showErrors ? errors[field.id] : undefined;

        if (field.type === "select" && field.options) {
          return (
            <Select
              key={field.id}
              field={field}
              value={val}
              error={err}
              disabled={disabled}
              readOnly={readOnly}
              classNames={classNames}
              styles={styles}
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
            disabled={disabled}
            readOnly={readOnly}
            classNames={classNames}
            styles={styles}
            onChange={handleFieldChange}
          />
        );
      })}
    </div>
  );
}

const Address = Object.assign(AddressComponent, {
  Root: AddressRoot,
  Country: AddressCountry,
  Fields: AddressFields,
  Field: AddressField,
  Label: AddressLabel,
  Input: AddressInput,
  Select: AddressSelect,
  Error: AddressError,
});

export { Address };
export type { AddressProps };
