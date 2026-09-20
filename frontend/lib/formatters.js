/**
 * Utility functions for formatting prices, dates, durations, and calculating discounts.
 */

export const formatCurrency = (amount, currency = 'USD') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const calculateDiscountPrice = (originalPrice, discountPercent) => {
  const price = Number(originalPrice) || 0;
  const pct = Number(discountPercent) || 0;
  if (pct <= 0) return price;
  const effective = price * (1 - pct / 100);
  return Math.round(effective * 100) / 100;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
