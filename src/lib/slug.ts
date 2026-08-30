import { randomBytes } from "crypto";

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"; // sem caracteres ambíguos (0/o, 1/l/i)

export function generateSlug(length = 6): string {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}
