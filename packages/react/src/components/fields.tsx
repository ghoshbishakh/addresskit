import type { CSSProperties } from "react";
import type { Field, FieldId } from "@addresskit/core";

interface AddressClassNames {
  root?: string;
  field?: string;
  label?: string;
  input?: string;
  select?: string;
  error?: string;
  required?: string;
}

interface AddressStyles {
  root?: CSSProperties;
  field?: CSSProperties;
  label?: CSSProperties;
  input?: CSSProperties;
  select?: CSSProperties;
  error?: CSSProperties;
  required?: CSSProperties;
}

interface InputProps {
  field: Field;
  value: string;
  error?: string;
  onChange: (id: FieldId, value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  classNames?: AddressClassNames;
  styles?: AddressStyles;
}

interface SelectProps {
  field: Field;
  value: string;
  error?: string;
  onChange: (id: FieldId, value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  classNames?: AddressClassNames;
  styles?: AddressStyles;
}

interface FieldComponents {
  Input?: React.ComponentType<InputProps>;
  Select?: React.ComponentType<SelectProps>;
}

function DefaultInput({
  field,
  value,
  error,
  onChange,
  disabled,
  readOnly,
  classNames,
  styles,
}: InputProps) {
  return (
    <div
      className={classNames?.field}
      style={{ marginBottom: 12, ...styles?.field }}
    >
      <label
        htmlFor={`address-field-${field.id}`}
        className={classNames?.label}
        style={{ display: "block", marginBottom: 4, fontWeight: 500, ...styles?.label }}
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
      <input
        id={`address-field-${field.id}`}
        type="text"
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={classNames?.input}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
          borderRadius: 4,
          boxSizing: "border-box",
          opacity: disabled ? 0.6 : 1,
          ...styles?.input,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `address-error-${field.id}` : undefined}
      />
      {error && (
        <p
          id={`address-error-${field.id}`}
          className={classNames?.error}
          style={{ color: "#d32f2f", fontSize: 12, margin: "4px 0 0", ...styles?.error }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function DefaultSelect({
  field,
  value,
  error,
  onChange,
  disabled,
  readOnly,
  classNames,
  styles,
}: SelectProps) {
  return (
    <div
      className={classNames?.field}
      style={{ marginBottom: 12, ...styles?.field }}
    >
      <label
        htmlFor={`address-field-${field.id}`}
        className={classNames?.label}
        style={{ display: "block", marginBottom: 4, fontWeight: 500, ...styles?.label }}
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
      <select
        id={`address-field-${field.id}`}
        value={value}
        required={field.required}
        disabled={disabled || readOnly}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={classNames?.select}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
          borderRadius: 4,
          boxSizing: "border-box",
          background: "#fff",
          opacity: disabled ? 0.6 : 1,
          ...styles?.select,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `address-error-${field.id}` : undefined}
      >
        <option value="">Select {field.label}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`address-error-${field.id}`}
          className={classNames?.error}
          style={{ color: "#d32f2f", fontSize: 12, margin: "4px 0 0", ...styles?.error }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { DefaultInput, DefaultSelect };
export type {
  AddressClassNames,
  AddressStyles,
  InputProps,
  SelectProps,
  FieldComponents,
};
