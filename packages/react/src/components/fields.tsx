import type { Field, FieldId } from "@addresskit/core";

interface InputProps {
  field: Field;
  value: string;
  error?: string;
  onChange: (id: FieldId, value: string) => void;
}

export function DefaultInput({ field, value, error, onChange }: InputProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        htmlFor={`address-field-${field.id}`}
        style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
      >
        {field.label}
        {field.required && <span style={{ color: "#d32f2f", marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={`address-field-${field.id}`}
        type="text"
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        onChange={(e) => onChange(field.id, e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
          borderRadius: 4,
          boxSizing: "border-box",
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `address-error-${field.id}` : undefined}
      />
      {error && (
        <p
          id={`address-error-${field.id}`}
          style={{ color: "#d32f2f", fontSize: 12, margin: "4px 0 0" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps {
  field: Field;
  value: string;
  error?: string;
  onChange: (id: FieldId, value: string) => void;
}

export function DefaultSelect({ field, value, error, onChange }: SelectProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        htmlFor={`address-field-${field.id}`}
        style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
      >
        {field.label}
        {field.required && <span style={{ color: "#d32f2f", marginLeft: 2 }}>*</span>}
      </label>
      <select
        id={`address-field-${field.id}`}
        value={value}
        required={field.required}
        onChange={(e) => onChange(field.id, e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: `1px solid ${error ? "#d32f2f" : "#ccc"}`,
          borderRadius: 4,
          boxSizing: "border-box",
          background: "#fff",
        }}
        aria-invalid={!!error}
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
          style={{ color: "#d32f2f", fontSize: 12, margin: "4px 0 0" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export interface FieldComponents {
  Input?: typeof DefaultInput;
  Select?: typeof DefaultSelect;
}
