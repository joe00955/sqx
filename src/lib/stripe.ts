const paymentLink = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK;
const portalLink = process.env.EXPO_PUBLIC_STRIPE_PORTAL_LINK;

export const isPaywallConfigured = !!paymentLink;

export function buildCheckoutUrl(userId: string, email?: string): string | null {
  if (!paymentLink) return null;
  const url = new URL(paymentLink);
  url.searchParams.set('client_reference_id', userId);
  if (email) url.searchParams.set('prefilled_email', email);
  return url.toString();
}

export function portalLoginUrl(): string | null {
  return portalLink ?? null;
}
