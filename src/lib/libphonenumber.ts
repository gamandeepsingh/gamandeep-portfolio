import metadataJson from "@/assets/libphonenumber.metadata.json"
import type { MetadataJson } from "libphonenumber-js/core"
import { formatIncompletePhoneNumber as _formatIncompletePhoneNumber } from "libphonenumber-js/core"

const metadata = metadataJson as MetadataJson

/**
 * Formats an incomplete phone number string according to the metadata provided (currently only for India).
 *
 * Uses `libphonenumber-js`'s `formatIncompletePhoneNumber` function with custom metadata.
 *
 * @param phone - The phone number string to format (may be incomplete).
 * @returns The formatted phone number string.
 *
 * @remarks
 * - Only India (IN) metadata is included by default. To add more countries, run `npx libphonenumber-metadata-generator ./src/assets/libphonenumber.metadata.json --countries IN,XX --extended`.
 * - This function is useful for formatting user input as they type a phone number.
 *
 * @see https://www.npmjs.com/package/libphonenumber-js#customizing-metadata
 */
export function formatIncompletePhoneNumber(phone: string) {
  return _formatIncompletePhoneNumber(phone, metadata)
}
