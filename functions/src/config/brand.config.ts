/**
 * Brand configuration for Home2Students email templates
 */
export const brandConfig = {
  name: 'Home2Students',
  supportEmail: 'hello@home2students.pt',
  noreplyEmail: 'noreply@home2students.pt',
  websiteUrl: 'https://home2students.pt',
  address: 'Avenida da República 50, 1050-196 Lisboa, Portugal',

  // Email defaults
  fromName: 'Home2Students',
  // Temporarily using procimo.com for testing (change to noreply@home2students.pt after domain verification)
  fromEmail: 'noreply@procimo.com',
} as const;

export type BrandConfig = typeof brandConfig;
