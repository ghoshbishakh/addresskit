import { useState, useEffect, useCallback } from "react";
import { createEngine } from "@addresskit/core";
import type { Address, AddressSchema, ValidationResult } from "@addresskit/core";
import { useAddressProvider } from "./context";

export function useAddressSchema(country: string): AddressSchema | null {
  const provider = useAddressProvider();
  const [schema, setSchema] = useState<AddressSchema | null>(null);

  useEffect(() => {
    let cancelled = false;
    const engine = createEngine(provider);

    engine.getSchema(country).then((result) => {
      if (!cancelled) setSchema(result);
    });

    return () => {
      cancelled = true;
    };
  }, [country, provider]);

  return schema;
}

export function useAddressValidation(address: Address): ValidationResult | null {
  const provider = useAddressProvider();
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const engine = createEngine(provider);

    engine.validate(address).then((validation) => {
      if (!cancelled) setResult(validation);
    });

    return () => {
      cancelled = true;
    };
  }, [address, provider]);

  return result;
}

export function useAddressFormat(address: Address): string {
  const provider = useAddressProvider();
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    let cancelled = false;
    const engine = createEngine(provider);

    engine.validate(address).then(() => {
      if (!cancelled) {
        setFormatted(engine.format(address));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [address, provider]);

  return formatted;
}

export function useAddressEngine() {
  const provider = useAddressProvider();

  const getSchema = useCallback(
    async (country: string) => {
      const engine = createEngine(provider);
      return engine.getSchema(country);
    },
    [provider],
  );

  const validate = useCallback(
    async (address: Address) => {
      const engine = createEngine(provider);
      return engine.validate(address);
    },
    [provider],
  );

  const format = useCallback(
    (address: Address) => {
      const engine = createEngine(provider);
      return engine.format(address);
    },
    [provider],
  );

  return { getSchema, validate, format };
}
