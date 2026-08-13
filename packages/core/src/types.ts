type FieldId = "line1" | "line2" | "locality" | "administrativeArea" | "postalCode";

type FieldType = "text" | "select" | "combobox";

interface FieldOption {
  value: string;
  label: string;
}

interface Field {
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

interface AddressSchema {
  fields: Field[];
  country: string;
  format: string;
}

interface Address {
  country: string;
  line1: string;
  line2?: string;
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
}

interface ValidationError {
  field: FieldId | "country";
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

type CustomValidator = (
  address: Address,
  config?: CountryAddressConfig,
) => ValidationError[] | Promise<ValidationError[]>;

interface ValidationOptions {
  customValidators?: CustomValidator[];
  allowUnknownSubregions?: boolean;
}

interface FormatOptions {
  singleLine?: boolean;
  includeCountry?: boolean;
  countryName?: string;
}

interface NormalizeOptions {
  trim?: boolean;
  uppercaseFields?: boolean;
  canonicalizeSubregion?: boolean;
}

interface PostalLookupResult {
  locality?: string;
  administrativeArea?: string;
}

interface CountryAddressConfig {
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
  subRegions?: { name: string; code: string }[];
}

interface AddressProvider {
  getCountries(): Promise<{ code: string; name: string }[]>;
  getStates(country: string): Promise<{ code: string; name: string }[]>;
  getCities(country: string, state: string): Promise<string[]>;
  getMetadata(country: string): Promise<CountryAddressConfig>;
  lookupPostalCode?(postalCode: string, country: string): Promise<PostalLookupResult | null>;
}

export type {
  FieldId,
  FieldType,
  FieldOption,
  Field,
  AddressSchema,
  Address,
  ValidationError,
  ValidationResult,
  CustomValidator,
  ValidationOptions,
  FormatOptions,
  NormalizeOptions,
  PostalLookupResult,
  CountryAddressConfig,
  AddressProvider,
};
