import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { Address } from "@addresskit/react";
import type { Address as AddressType, AddressProvider } from "@addresskit/core";
import type { FieldComponents } from "@addresskit/react";

interface AddressControllerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  allowedCountries?: string[];
  components?: FieldComponents;
  provider?: AddressProvider;
  disabled?: boolean;
}

export function AddressController<T extends FieldValues>({
  name,
  control,
  rules,
  allowedCountries,
  components,
  provider,
  disabled,
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
          <div>
            <Address
              value={addressValue}
              onChange={(updated) => field.onChange(updated)}
              allowedCountries={allowedCountries}
              components={components}
              provider={provider}
            />
            {fieldState.error?.message && (
              <div
                role="alert"
                style={{ color: "red", fontSize: "0.875em", marginTop: 4 }}
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
