import { useState, useEffect, useMemo } from "react";
import { createEngine } from "@addresskit/core";
import type { Address, AddressSchema, Engine, ValidationResult } from "@addresskit/core";
import { useAddressProvider } from "./context";

/**
 * A single engine instance per provider. Memoizing here keeps the engine's
 * metadata cache alive across renders instead of rebuilding it every effect.
 */
export function useAddressEngine(): Engine {
  const provider = useAddressProvider();
  return useMemo(() => createEngine(provider), [provider]);
}

export function useAddressSchema(country: string): AddressSchema | null {
  const engine = useAddressEngine();
  const [schema, setSchema] = useState<AddressSchema | null>(null);

  useEffect(() => {
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

export function useAddressValidation(address: Address): ValidationResult | null {
  const engine = useAddressEngine();
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    engine.validate(address).then((validation) => {
      if (!cancelled) setResult(validation);
    });
    return () => {
      cancelled = true;
    };
  }, [address, engine]);

  return result;
}

export function useAddressFormat(address: Address): string {
  const engine = useAddressEngine();
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    let cancelled = false;
    engine.format(address).then((result) => {
      if (!cancelled) setFormatted(result);
    });
    return () => {
      cancelled = true;
    };
  }, [address, engine]);

  return formatted;
}
