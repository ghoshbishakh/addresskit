import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  Address as AddressType,
  AddressProvider,
  Field,
  FieldId,
  ValidationResult,
} from "@addresskit/core";
import { useAddressForm } from "../hooks";
import type {
  AddressClassNames,
  AddressStyles,
} from "./fields";

interface AddressFormContextValue {
  address: Partial<AddressType>;
  setAddress: (address: Partial<AddressType>) => void;
  setFieldValue: (field: FieldId, value: string) => void;
  setCountry: (country: string) => void;
  fields: Field[];
  errors: Record<string, string>;
  countries: { code: string; name: string }[];
  disabled?: boolean;
  readOnly?: boolean;
  showErrors?: boolean;
  classNames?: AddressClassNames;
  styles?: AddressStyles;
}

const AddressFormContext = createContext<AddressFormContextValue | null>(null);

function useAddressFormContext(): AddressFormContextValue {
  const ctx = useContext(AddressFormContext);
  if (!ctx) {
    throw new Error("Address compound primitives must be used within <Address.Root>");
  }
  return ctx;
}

interface AddressFieldContextValue {
  field: Field;
  value: string;
  error?: string;
}

const AddressFieldContext = createContext<AddressFieldContextValue | null>(null);

function useAddressFieldContext(): AddressFieldContextValue {
  const ctx = useContext(AddressFieldContext);
  if (!ctx) {
    throw new Error("Address field primitives must be used within <Address.Field>");
  }
  return ctx;
}

interface AddressRootProps {
  children: ReactNode;
  value: Partial<AddressType>;
  onChange: (address: Partial<AddressType>) => void;
  allowedCountries?: string[];
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

function AddressRoot({
  children,
  value,
  onChange,
  allowedCountries,
  provider,
  disabled,
  readOnly,
  showErrors = true,
  onValidationChange,
  className,
  style,
  classNames,
  styles,
  fieldOverrides,
}: AddressRootProps) {
  const {
    fields,
    errors,
    countries,
    setFieldValue,
    setCountry,
  } = useAddressForm({
    initialAddress: value,
    allowedCountries,
    provider,
    onValidationChange,
    fieldOverrides,
  });

  const contextValue = useMemo<AddressFormContextValue>(
    () => ({
      address: value,
      setAddress: onChange,
      setFieldValue: (id, val) => {
        setFieldValue(id, val);
        onChange({ ...value, [id]: val || undefined });
      },
      setCountry: (newCountry) => {
        setCountry(newCountry);
      },
      fields,
      errors,
      countries,
      disabled,
      readOnly,
      showErrors,
      classNames,
      styles,
    }),
    [
      value,
      onChange,
      setFieldValue,
      setCountry,
      fields,
      errors,
      countries,
      disabled,
      readOnly,
      showErrors,
      classNames,
      styles,
    ],
  );

  return (
    <AddressFormContext.Provider value={contextValue}>
      <div
        className={className ?? classNames?.root}
        style={{ ...styles?.root, ...style }}
      >
        {children}
      </div>
    </AddressFormContext.Provider>
  );
}

interface AddressCountryProps {
  label?: string;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

function AddressCountry({
  label = "Country",
  className,
  style,
  placeholder = "Select country",
}: AddressCountryProps) {
  const {
    address,
    setCountry,
    countries,
    disabled,
    readOnly,
    classNames,
    styles,
  } = useAddressFormContext();

  return (
    <div
      className={classNames?.field}
      style={{ marginBottom: 12, ...styles?.field }}
    >
      <label
        htmlFor="address-primitive-country"
        className={classNames?.label}
        style={{ display: "block", marginBottom: 4, fontWeight: 500, ...styles?.label }}
      >
        {label}
      </label>
      <select
        id="address-primitive-country"
        value={address.country ?? ""}
        disabled={disabled || readOnly}
        onChange={(e) => setCountry(e.target.value)}
        className={className ?? classNames?.select}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: 4,
          boxSizing: "border-box",
          background: "#fff",
          opacity: disabled ? 0.6 : 1,
          ...styles?.select,
          ...style,
        }}
      >
        <option value="">{placeholder}</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface AddressFieldsProps {
  children: (field: Field) => ReactNode;
}

function AddressFields({ children }: AddressFieldsProps) {
  const { fields } = useAddressFormContext();
  return <>{fields.map((field) => children(field))}</>;
}

interface AddressFieldProps {
  field: Field;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function AddressField({ field, children, className, style }: AddressFieldProps) {
  const { address, errors, classNames, styles } = useAddressFormContext();
  const value = (address[field.id as keyof AddressType] as string) ?? "";
  const error = errors[field.id];

  const fieldContextValue = useMemo<AddressFieldContextValue>(
    () => ({
      field,
      value,
      error,
    }),
    [field, value, error],
  );

  return (
    <AddressFieldContext.Provider value={fieldContextValue}>
      <div
        className={className ?? classNames?.field}
        style={{ marginBottom: 12, ...styles?.field, ...style }}
      >
        {children}
      </div>
    </AddressFieldContext.Provider>
  );
}

interface AddressLabelProps {
  className?: string;
  style?: CSSProperties;
}

function AddressLabel({ className, style }: AddressLabelProps) {
  const { classNames, styles } = useAddressFormContext();
  const { field } = useAddressFieldContext();

  return (
    <label
      htmlFor={`address-field-${field.id}`}
      className={className ?? classNames?.label}
      style={{ display: "block", marginBottom: 4, fontWeight: 500, ...styles?.label, ...style }}
    >
      {field.label}
      {field.required && (
        <span
          className={classNames?.required}
          style={{ color: "#d32f2f", marginLeft: 2, ...styles?.required }}
        >
          *
        </span>
      )}
    </label>
  );
}

interface AddressInputProps {
  className?: string;
  style?: CSSProperties;
}

function AddressInput({ className, style }: AddressInputProps) {
  const { setFieldValue, disabled, readOnly, classNames, styles } =
    useAddressFormContext();
  const { field, value, error } = useAddressFieldContext();

  return (
    <input
      id={`address-field-${field.id}`}
      type="text"
      value={value}
      placeholder={field.placeholder}
      required={field.required}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(e) => setFieldValue(field.id, e.target.value)}
      className={className ?? classNames?.input}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
        borderRadius: 4,
        boxSizing: "border-box",
        opacity: disabled ? 0.6 : 1,
        ...styles?.input,
        ...style,
      }}
      aria-invalid={!!error}
      aria-describedby={error ? `address-error-${field.id}` : undefined}
    />
  );
}

interface AddressSelectProps {
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

function AddressSelect({
  className,
  style,
  placeholder,
}: AddressSelectProps) {
  const { setFieldValue, disabled, readOnly, classNames, styles } =
    useAddressFormContext();
  const { field, value, error } = useAddressFieldContext();

  return (
    <select
      id={`address-field-${field.id}`}
      value={value}
      required={field.required}
      disabled={disabled || readOnly}
      onChange={(e) => setFieldValue(field.id, e.target.value)}
      className={className ?? classNames?.select}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
        borderRadius: 4,
        boxSizing: "border-box",
        background: "#fff",
        opacity: disabled ? 0.6 : 1,
        ...styles?.select,
        ...style,
      }}
      aria-invalid={!!error}
      aria-describedby={error ? `address-error-${field.id}` : undefined}
    >
      <option value="">{placeholder ?? `Select ${field.label}`}</option>
      {field.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface AddressErrorProps {
  className?: string;
  style?: CSSProperties;
}

function AddressError({ className, style }: AddressErrorProps) {
  const { showErrors, classNames, styles } = useAddressFormContext();
  const { field, error } = useAddressFieldContext();

  if (!showErrors || !error) return null;

  return (
    <p
      id={`address-error-${field.id}`}
      className={className ?? classNames?.error}
      style={{ color: "#d32f2f", fontSize: 12, margin: "4px 0 0", ...styles?.error, ...style }}
      role="alert"
    >
      {error}
    </p>
  );
}

export {
  AddressRoot,
  AddressCountry,
  AddressFields,
  AddressField,
  AddressLabel,
  AddressInput,
  AddressSelect,
  AddressError,
  useAddressFormContext,
  useAddressFieldContext,
};
export type {
  AddressRootProps,
  AddressCountryProps,
  AddressFieldsProps,
  AddressFieldProps,
  AddressLabelProps,
  AddressInputProps,
  AddressSelectProps,
  AddressErrorProps,
};
