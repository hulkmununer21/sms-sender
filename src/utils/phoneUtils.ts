import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validates if a given string is a structurally valid phone number
 * @param phoneNumber - Phone number string to validate
 * @param defaultCountry - Default country code (e.g., 'US') for parsing numbers without +1
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phoneNumber: string, defaultCountry = 'US'): boolean => {
  if (!phoneNumber || phoneNumber.trim() === '') return false;
  return isValidPhoneNumber(phoneNumber, defaultCountry as any);
};

/**
 * Formats a phone number to E.164 standard format (+1234567890 for US)
 * @param phoneNumber - Phone number string to format
 * @param defaultCountry - Default country code (e.g., 'US') for parsing numbers without +1
 * @returns Formatted phone number in E.164 format, or null if invalid
 */
export const formatToE164 = (phoneNumber: string, defaultCountry = 'US'): string | null => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry as any);
    if (!parsed) return null;
    return parsed.format('E.164');
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return null;
  }
};

/**
 * Formats a phone number to human-readable format (e.g., (123) 456-7890)
 * @param phoneNumber - Phone number string to format
 * @param defaultCountry - Default country code (e.g., 'US')
 * @returns Formatted phone number in national format, or original if invalid
 */
export const formatToNational = (phoneNumber: string, defaultCountry = 'US'): string => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry as any);
    if (!parsed) return phoneNumber;
    return parsed.formatNational();
  } catch (error) {
    return phoneNumber;
  }
};

/**
 * Extracts area code from a phone number
 * @param phoneNumber - Phone number string
 * @param defaultCountry - Default country code
 * @returns Area code (first 3 digits) or null if invalid
 */
export const getAreaCode = (phoneNumber: string, defaultCountry = 'US'): string | null => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry as any);
    if (!parsed) return null;
    const e164 = parsed.format('E.164');
    // For US numbers: +1 (1 digit) + area code (3 digits) + rest
    // Extract the 3 digits after +1
    const match = e164.match(/\+1(\d{3})/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

/**
 * Gets the country code from a phone number
 * @param phoneNumber - Phone number string
 * @param defaultCountry - Default country code
 * @returns Country code (e.g., 'US') or null if invalid
 */
export const getCountryCode = (phoneNumber: string, defaultCountry = 'US'): string | null => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry as any);
    return parsed?.country || null;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if a phone number belongs to a specific country
 * @param phoneNumber - Phone number string
 * @param countryCode - Country code to check (e.g., 'US')
 * @returns true if number belongs to country, false otherwise
 */
export const isCountry = (phoneNumber: string, countryCode: string): boolean => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, countryCode as any);
    return parsed?.country === countryCode;
  } catch (error) {
    return false;
  }
};

/**
 * Batch formats multiple phone numbers to E.164
 * @param phoneNumbers - Array of phone number strings
 * @param defaultCountry - Default country code
 * @returns Array of formatted numbers, excluding invalid ones
 */
export const batchFormatToE164 = (phoneNumbers: string[], defaultCountry = 'US'): string[] => {
  return phoneNumbers
    .map((number) => formatToE164(number, defaultCountry))
    .filter((number) => number !== null) as string[];
};

/**
 * Validates and formats multiple phone numbers
 * @param phoneNumbers - Array of phone number strings
 * @param defaultCountry - Default country code
 * @returns Object with valid and invalid phone numbers
 */
export const validateAndFormatBatch = (
  phoneNumbers: string[],
  defaultCountry = 'US'
): { valid: Array<{ original: string; formatted: string }> ; invalid: string[] } => {
  const valid: Array<{ original: string; formatted: string }> = [];
  const invalid: string[] = [];

  phoneNumbers.forEach((number) => {
    const formatted = formatToE164(number, defaultCountry);
    if (formatted) {
      valid.push({ original: number, formatted });
    } else {
      invalid.push(number);
    }
  });

  return { valid, invalid };
};

export default {
  validatePhoneNumber,
  formatToE164,
  formatToNational,
  getAreaCode,
  getCountryCode,
  isCountry,
  batchFormatToE164,
  validateAndFormatBatch,
};
