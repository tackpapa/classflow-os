import { getInstitutionName } from '@/lib/config/navigation'

/**
 * Get href with institution prefix
 * @param path - The path without institution name (e.g., '/students')
 * @param institutionName - Optional institution name override
 * @returns Full path with institution prefix (e.g., '/goldpen/students')
 */
export function getInstitutionHref(path: string, institutionName?: string): string {
  const institution = institutionName || getInstitutionName()
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `/${institution}${cleanPath}`
}

/**
 * Navigate to a path with institution prefix
 * Usage with router: router.push(getInstitutionHref('/students'))
 */
export { getInstitutionHref as navTo }
