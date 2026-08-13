import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createEngine } from "@addresskit/core";
import type {
  Address,
  AddressSchema,
  Engine,
  ValidationResult,
  ValidationOptions,
  FormatOptions,
  Field,
  FieldId,
  AddressProvider,
} from "@addresskit/core";
import { useAddressProvider } from "./context";

function useAddressEngine(explicitProvider?: AddressProvider): Engine {
  const provider = useAddressProvider(explicitProvider);
  return useMemo(() => createEngine(provider), [provider]);
}

function useAddressSchema(
  country?: string,
  explicitProvider?: AddressProvider,
): AddressSchema | null {
  const engine = useAddressEngine(explicitProvider);
  const [schema, setSchema] = useState<AddressSchema | null>(null);

  useEffect(() => {
    if (!country) {
      setSchema(null);
      return;
    }
    let cancelled = false;
    engine.getSchema(country).then((result) => {
      if (!cancelled) setSchema(result);
    });
    return () => {
      cancelled = true;
    };
  }, [country, engine]);

  return schema;
}

function useAddressValidation(
  address: Address,
  options?: ValidationOptions,
  explicitProvider?: AddressProvider,
): ValidationResult | null {
  const engine = useAddressEngine(explicitProvider);
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (!address.country) {
      setResult(null);
      return;
    }
    let cancelled = false;
    engine.validate(address, options).then((validation) => {
      if (!cancelled) setResult(validation);
    });
    return () => {
      cancelled = true;
    };
  }, [
    address.country,
    address.line1,
    address.line2,
    address.locality,
    address.administrativeArea,
    address.postalCode,
    engine,
    options,
  ]);

  return result;
}

function useAddressFormat(
  address: Address,
  options?: FormatOptions,
  explicitProvider?: AddressProvider,
): string {
  const engine = useAddressEngine(explicitProvider);
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!address.country) {
      setFormatted("");
      return;
    }
    let cancelled = false;
    engine.format(address, options).then((result) => {
      if (!cancelled) setFormatted(result);
    });
    return () => {
      cancelled = true;
    };
  }, [
    address.country,
    address.line1,
    address.line2,
    address.locality,
    address.administrativeArea,
    address.postalCode,
    engine,
    options,
  ]);

  return formatted;
}

function useCountries(
  allowedCountries?: string[],
  explicitProvider?: AddressProvider,
): { countries: { code: string; name: string }[]; isLoading: boolean } {
  const provider = useAddressProvider(explicitProvider);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const allowedKey = allowedCountries?.join(",");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    provider.getCountries().then((all) => {
      if (!cancelled) {
        if (allowedCountries && allowedCountries.length > 0) {
          setCountries(all.filter((c) => allowedCountries.includes(c.code)));
        } else {
          setCountries(all);
        }
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [provider, allowedKey]);

  return { countries, isLoading };
}

function useStates(
  country?: string,
  explicitProvider?: AddressProvider,
): { states: { code: string; name: string }[]; isLoading: boolean } {
  const provider = useAddressProvider(explicitProvider);
  const [states, setStates] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!country) {
      setStates([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    provider.getStates(country).then((result) => {
      if (!cancelled) {
        setStates(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [country, provider]);

  return { states, isLoading };
}

function useCities(
  country?: string,
  state?: string,
  explicitProvider?: AddressProvider,
): { cities: string[]; isLoading: boolean } {
  const provider = useAddressProvider(explicitProvider);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    provider.getCities(country, state).then((result) => {
      if (!cancelled) {
        setCities(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [country, state, provider]);

  return { cities, isLoading };
}

interface UseAddressFormOptions {
  initialAddress?: Partial<Address>;
  allowedCountries?: string[];
  provider?: AddressProvider;
  onValidationChange?: (result: ValidationResult) => void;
  fieldOverrides?: Partial<Record<FieldId, Partial<Field>>>;
}

function useAddressForm(options?: UseAddressFormOptions) {
  const [address, setAddressState] = useState<Partial<Address>>(
    options?.initialAddress ?? {},
  );
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const prevCountryRef = useRef<string | null>(address.country ?? null);
  const addressRef = useRef(address);
  addressRef.current = address;

  const engine = useAddressEngine(options?.provider);
  const { countries, isLoading: isCountriesLoading } = useCountries(
    options?.allowedCountries,
    options?.provider,
  );

  const setAddress = useCallback((next: Partial<Address>) => {
    setAddressState(next);
  }, []);

  const setCountry = useCallback(
    (newCountry: string) => {
      const oldCountry = prevCountryRef.current;
      prevCountryRef.current = newCountry;

      const current = addressRef.current;
      const cleaned = oldCountry
        ? engine.clearInvalidValues(current as Address, oldCountry, newCountry)
        : { country: newCountry };

      setAddressState(cleaned);
    },
    [engine],
  );

  const setFieldValue = useCallback(
    (field: FieldId, val: string) => {
      const current = addressRef.current;
      const updated = { ...current, [field]: val || undefined };

      if (field === "administrativeArea") {
        const cleaned = engine.clearState(updated as Address);
        setAddressState({
          ...cleaned,
          administrativeArea: val || undefined,
        });
        return;
      }

      setAddressState(updated);
    },
    [engine],
  );

  useEffect(() => {
    if (!address.country) {
      setFields([]);
      return;
    }

    engine
      .getSchema(address.country)
      .then((schema) => {
        let schemaFields = schema.fields;
        if (options?.fieldOverrides) {
          schemaFields = schemaFields.map((f) => {
            const override = options.fieldOverrides?.[f.id];
            return override ? { ...f, ...override } : f;
          });
        }
        setFields(schemaFields);
      })
      .catch(() => {
        setFields([]);
      });
  }, [address.country, engine, options?.fieldOverrides]);

  useEffect(() => {
    if (!address.country || !address.line1) {
      setErrors({});
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      try {
        const result = await engine.validate(address as Address);
        const errMap: Record<string, string> = {};
        for (const err of result.errors) {
          errMap[err.field] = err.message;
        }
        setErrors(errMap);
        setValidationResult(result);
        setIsValidating(false);
        if (options?.onValidationChange) {
          options.onValidationChange(result);
        }
      } catch {
        setIsValidating(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [
    address.country,
    address.line1,
    address.locality,
    address.administrativeArea,
    address.postalCode,
    engine,
    options?.onValidationChange,
  ]);

  const format = useCallback(
    (formatOptions?: FormatOptions) => {
      return engine.format(address as Address, formatOptions);
    },
    [engine, address],
  );

  const reset = useCallback(
    (newAddr?: Partial<Address>) => {
      prevCountryRef.current = newAddr?.country ?? null;
      setAddressState(newAddr ?? {});
      setErrors({});
      setValidationResult(null);
    },
    [],
  );

  return {
    address,
    setAddress,
    setFieldValue,
    setCountry,
    fields,
    errors,
    validationResult,
    isValid: validationResult?.valid ?? false,
    isValidating,
    isLoading: isCountriesLoading,
    countries,
    format,
    reset,
  };
}

export {
  useAddressEngine,
  useAddressSchema,
  useAddressValidation,
  useAddressFormat,
  useCountries,
  useStates,
  useCities,
  useAddressForm,
};
export type { UseAddressFormOptions };
