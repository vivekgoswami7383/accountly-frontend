import { parsePhoneNumberFromString, validatePhoneNumberLength, CountryCode } from 'libphonenumber-js/min';
import { CountryType } from 'data/countries';

const FIXED_NATIONAL_LENGTH: { [code: string]: number } = { IN: 10, ID: 12 };

export const limitPhoneDigits = (country: CountryType, digits: string) => {
  const trunkPrefix = digits.startsWith('0') ? 1 : 0;
  const fixed = FIXED_NATIONAL_LENGTH[country.code];
  let next = fixed ? digits.slice(0, fixed + trunkPrefix) : digits;
  while (next.length > 0 && validatePhoneNumberLength(next, country.code as CountryCode) === 'TOO_LONG') next = next.slice(0, -1);
  return next.slice(0, 15);
};

export const toNationalDigits = (country: CountryType, raw: string) => {
  const digits = raw.replace(/[^0-9]/g, '');
  const callingCode = country.phone.replace(/[^0-9]/g, '');
  if (raw.trim().startsWith('+') && digits.startsWith(callingCode)) return digits.slice(callingCode.length);
  return digits;
};

export const readPhoneInput = (country: CountryType, raw: string) => limitPhoneDigits(country, toNationalDigits(country, raw));

export const checkPhone = (country: CountryType, digits: string) => {
  const parsed = digits ? parsePhoneNumberFromString(digits, country.code as CountryCode) : undefined;
  return {
    number: parsed?.number || `${country.phone}${digits}`,
    valid: Boolean(parsed?.isValid()),
    possible: Boolean(parsed?.isPossible())
  };
};
