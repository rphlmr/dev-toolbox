import { useCallback, useMemo, useState } from "react";
import { CountryCode, parsePhoneNumber } from "../utils/phone-number";

export function usePhoneNumberInput(defaultCountryCode: CountryCode = "FR") {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] =
    useState<ReturnType<typeof parsePhoneNumber>>();

  const _setPhoneNumber = useCallback(
    (input: string) => {
      const parsedPhoneNumber = parsePhoneNumber(input, countryCode);

      if (parsedPhoneNumber.formatted === phoneNumber?.formatted) return;

      setPhoneNumber(parsedPhoneNumber);
    },
    [countryCode, phoneNumber]
  );

  return useMemo(
    () => ({
      setPhoneNumber: _setPhoneNumber,
      phoneNumber: phoneNumber?.formatted ?? "",
      isValidPhoneNumber: Boolean(phoneNumber?.isValid),
      setCountryCode,
      countryCode,
    }),
    [_setPhoneNumber, phoneNumber?.formatted, phoneNumber?.isValid, countryCode]
  );
}
