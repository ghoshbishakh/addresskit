import type { CSSProperties } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { Address } from "@addresskit/react";
import type {
  AddressClassNames,
  AddressStyles,
  FieldComponents,
} from "@addresskit/react";
import type {
  Address as AddressType,
  AddressProvider,
  Field,
  FieldId,
  ValidationOptions,
  ValidationResult,
} from "@addresskit/core";
import { createValidator } from "@addresskit/validation";

interface AddressControllerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
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

function AddressController<T extends FieldValues>({
  name,
  control,
  rules,
  allowedCountries,
  components,
  provider,
  disabled,
  readOnly,
  showErrors,
  onValidationChange,
  className,
  style,
  classNames,
  styles,
  fieldOverrides,
}: AddressControllerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const addressValue = (field.value ?? {}) as Partial<AddressType>;
        return (
          <div className={className} style={style}>
            <Address
              value={addressValue}
              onChange={(updated) => field.onChange(updated)}
              allowedCountries={allowedCountries}
              components={components}
              provider={provider}
              disabled={disabled}
              readOnly={readOnly}
              showErrors={showErrors}
              onValidationChange={onValidationChange}
              classNames={classNames}
              styles={styles}
              fieldOverrides={fieldOverrides}
            />
            {fieldState.error?.message && (
              <div
                role="alert"
                className={classNames?.error}
                style={{
                  color: "#d32f2f",
                  fontSize: "0.875em",
                  marginTop: 4,
                  ...styles?.error,
                }}
              >
                {fieldState.error.message}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

function addressValidationRule(
  provider?: AddressProvider,
  options?: ValidationOptions,
) {
  const validator = createValidator(provider, options);
  return async (value: unknown) => {
    if (!value || typeof value !== "object") return true;
    const addr = value as Partial<AddressType>;
    if (!addr.country) return true;
    const result = await validator.validateAddress(addr as AddressType);
    if (!result.valid && result.errors.length > 0) {
      return result.errors[0]?.message ?? "Invalid address";
    }
    return true;
  };
}

export { AddressController, addressValidationRule };
export type { AddressControllerProps };
