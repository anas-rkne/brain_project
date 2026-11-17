import { getPayload } from 'payload'

import config from '@payload-config'

/**
 * Payload's Local API is safe inside Server Components: it never leaves the server.
 * `getPayload` is memoised internally, so calling this per request is fine.
 */
export function getPayloadClient() {
  return getPayload({ config })
}
