import { parsePhoneNumber } from "./phone-number";

describe(parsePhoneNumber.name, () => {
  it("should returns validation error when phone number or country code are empty", () => {
    // @ts-expect-error - we're testing the implementation here
    const phoneNumber = parsePhoneNumber("", "");
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "",
      formatted: "",
      validationError: "empty-phone-number-or-invalid-country-code",
    });
  });

  it("should returns validation error when phone number is empty", () => {
    const phoneNumber = parsePhoneNumber("", "FR");
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "",
      formatted: "",
      validationError: "empty-phone-number-or-invalid-country-code",
    });
  });

  it("should returns validation error when country code is empty", () => {
    // @ts-expect-error - we're testing the implementation here
    const phoneNumber = parsePhoneNumber("0606060606", "");
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "",
      formatted: "",
      validationError: "empty-phone-number-or-invalid-country-code",
    });
  });

  it("should returns prettified phone number at first char", () => {
    const phoneNumber = parsePhoneNumber("0", "FR");
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "",
      formatted: "0",
      validationError: undefined,
    });
  });

  it("should returns validation error if phone number is not mobile", () => {
    const phoneNumber = parsePhoneNumber("05", "FR");
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "",
      formatted: "05",
      validationError: "only-mobile-phone-numbers-allowed",
    });
  });

  it("should returns phone number if it's not mobile", () => {
    const phoneNumber = parsePhoneNumber("05", "FR", { mobileOnly: false });
    expect(phoneNumber).toEqual({
      isValid: false,
      value: "+3305",
      formatted: "05",
      validationError: undefined,
    });
  });

  it("should returns valid phone number when input is formatted", () => {
    const phoneNumber = parsePhoneNumber("06 06 06 06 06", "FR");
    expect(phoneNumber).toEqual({
      isValid: true,
      value: "+33606060606",
      formatted: "06 06 06 06 06",
      validationError: undefined,
    });
  });

  it("should returns valid phone number when input is msisdn (E.164)", () => {
    const phoneNumber = parsePhoneNumber("+33606060606", "FR");
    expect(phoneNumber).toEqual({
      isValid: true,
      value: "+33606060606",
      formatted: "06 06 06 06 06",
      validationError: undefined,
    });
  });

  it("should returns valid phone number when input is msisdn (E.164) starting with 0", () => {
    const phoneNumber = parsePhoneNumber("+330606060606", "FR");
    expect(phoneNumber).toEqual({
      isValid: true,
      value: "+33606060606",
      formatted: "06 06 06 06 06",
      validationError: undefined,
    });
  });
});
