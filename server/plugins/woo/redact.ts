const BSN_REGEX = /\b\d{9}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+31|0)[\s-]?(?:\d[\s-]?){9}/g;
const IBAN_REGEX = /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g;
const POSTCODE_REGEX = /\b\d{4}\s?[A-Z]{2}\b/gi;

export interface RedactOptions {
  bsn?: boolean;
  email?: boolean;
  phone?: boolean;
  iban?: boolean;
  postcode?: boolean;
}

export function redactText(text: string, options: RedactOptions = {}): string {
  const {
    bsn = true,
    email = true,
    phone = true,
    iban = true,
    postcode = false,
  } = options;

  let result = text;

  if (bsn) {
    result = result.replace(BSN_REGEX, "[BSN VERWIJDERD]");
  }
  if (email) {
    result = result.replace(EMAIL_REGEX, "[E-MAIL VERWIJDERD]");
  }
  if (phone) {
    result = result.replace(PHONE_REGEX, "[TELEFOONNUMMER VERWIJDERD]");
  }
  if (iban) {
    result = result.replace(IBAN_REGEX, "[IBAN VERWIJDERD]");
  }
  if (postcode) {
    result = result.replace(POSTCODE_REGEX, "[POSTCODE VERWIJDERD]");
  }

  return result;
}

export function countSensitiveData(text: string): Record<string, number> {
  return {
    bsn: (text.match(BSN_REGEX) || []).length,
    email: (text.match(EMAIL_REGEX) || []).length,
    phone: (text.match(PHONE_REGEX) || []).length,
    iban: (text.match(IBAN_REGEX) || []).length,
    postcode: (text.match(POSTCODE_REGEX) || []).length,
  };
}

export function hasSensitiveData(text: string): boolean {
  const counts = countSensitiveData(text);
  return Object.values(counts).some((count) => count > 0);
}
