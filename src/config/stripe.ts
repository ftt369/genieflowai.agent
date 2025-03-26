/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  billingPortalUrl: '/api/stripe/create-customer-portal-session',
  checkoutUrl: '/api/stripe/create-checkout-session',
  cancelUrl: '/api/stripe/cancel-subscription',
  updateUrl: '/api/stripe/update-subscription',
};

/**
 * Test card numbers for Stripe
 */
export const STRIPE_TEST_CARDS = {
  success: '4242 4242 4242 4242',
  requiresAuth: '4000 0025 0000 3155',
  decline: '4000 0000 0000 0002',
};

/**
 * Payment method types supported by the application
 */
export const PAYMENT_METHOD_TYPES = ['card'];

/**
 * Currency configuration
 */
export const CURRENCY_CONFIG = {
  defaultCurrency: 'usd',
  formatOptions: {
    style: 'currency',
    currency: 'usd',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

/**
 * Format price for display
 * @param amount - Amount in dollars
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price with interval
 * @param amount - Amount in dollars
 * @param interval - Billing interval (month, year)
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted price with interval
 */
export function formatPriceWithInterval(
  amount: number,
  interval: 'month' | 'year',
  currency = 'usd'
): string {
  const formattedPrice = formatPrice(amount, currency);
  return `${formattedPrice}/${interval === 'month' ? 'mo' : 'yr'}`;
} 