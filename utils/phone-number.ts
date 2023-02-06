import type { CountryCode as LibCountryCode } from "libphonenumber-js/max";
import PhoneNumber, { getCountries, AsYouType } from "libphonenumber-js/max";

export type CountryCode = LibCountryCode;

export function parsePhoneNumber(
  input: string,
  countryCode: CountryCode,
  { mobileOnly }: { mobileOnly?: boolean } = { mobileOnly: true }
): {
  isValid: boolean;
  value: string;
  formatted: string;
  validationError?:
    | "empty-phone-number"
    | "empty-country-code"
    | "only-mobile-phone-number-allowed";
} {
  if (input?.trim().length === 0) {
    return {
      isValid: false,
      value: "",
      formatted: "",
      validationError: "empty-phone-number",
    };
  }

  if (!getCountries().includes(countryCode)) {
    return {
      isValid: false,
      value: "",
      formatted: "",
      validationError: "empty-country-code",
    };
  }

  const phoneNumber = PhoneNumber(input, countryCode);

  if (!phoneNumber)
    return {
      isValid: false,
      value: "",
      formatted: new AsYouType(countryCode).input(input),
    };

  if (mobileOnly && phoneNumber.getType() !== "MOBILE")
    return {
      isValid: false,
      value: "",
      formatted: phoneNumber.formatNational(),
      validationError: "only-mobile-phone-number-allowed",
    };

  return {
    isValid: phoneNumber.isValid(),
    value: phoneNumber.number,
    formatted: phoneNumber.formatNational(),
  };
}
