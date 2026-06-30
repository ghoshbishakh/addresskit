export type FieldId = "line1" | "line2" | "locality" | "administrativeArea" | "postalCode";

export type FieldType = "text" | "select" | "combobox";

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  id: FieldId;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder: string;
  options?: FieldOption[];
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface AddressSchema {
  fields: Field[];
  country: string;
  format: string;
}

export interface Address {
  country: string;
  line1: string;
  line2?: string;
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
}

export interface ValidationError {
  field: FieldId;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface CountryAddressConfig {
  code: string;
  name?: string;
  format: string;
  requiredFields: FieldId[];
  fieldLabels: Partial<Record<FieldId, string>>;
  fieldPlaceholders: Partial<Record<FieldId, string>>;
  postalCodePattern?: string;
  administrativeAreaType: string;
  localityType: string;
  upperFields?: FieldId[];
  latinFormat?: string;
  subRegions?: { name: string; code: string }[];
}

export interface AddressProvider {
  getCountries(): Promise<{ code: string; name: string }[]>;
  getStates(country: string): Promise<{ code: string; name: string }[]>;
  getCities(country: string, state: string): Promise<string[]>;
  getMetadata(country: string): Promise<CountryAddressConfig>;
}
