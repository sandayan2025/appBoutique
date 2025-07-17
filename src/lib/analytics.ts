import { trackVisit } from './database';

export const trackPageView = (page: string, source?: string) => {
  try {
    trackVisit({
      page,
      source: source || undefined,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ip_address: undefined, // Will be handled by server-side if needed
      location: undefined // Will be handled by server-side if needed
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

export const trackProductView = (productId: string, productName: string, source?: string) => {
  try {
    trackVisit({
      product_id: productId,
      page: `Product: ${productName}`,
      source: source || undefined,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ip_address: undefined,
      location: undefined
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

export const trackAddToCart = (productId: string, productName: string, quantity: number, price: number) => {
  // This could be extended to track cart events in a separate table if needed
  console.log('Add to cart tracked:', { productId, productName, quantity, price });
};

export const trackPurchaseIntent = (items: any[], total: number) => {
  // This could be extended to track purchase intent events
  console.log('Purchase intent tracked:', { items, total });
};

export const getSourceFromURL = (): string | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('source') || undefined;
};