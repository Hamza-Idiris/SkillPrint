/**
 * Single entry point the rest of the app should import for payments.
 * Controlled by PAYMENT_MODE in .env:
 *   PAYMENT_MODE=mock  -> mockPaymentService (default — no real money, no network calls)
 *   PAYMENT_MODE=live  -> waafiPayService (real WaafiPay API_PURCHASE/API_REVERSAL)
 */
const mode = (process.env.PAYMENT_MODE || 'mock').toLowerCase();

const provider = mode === 'live' ? require('./waafiPayService') : require('./mockPaymentService');

if (mode !== 'live') {
  // Loud, deliberate reminder in server logs so nobody accidentally thinks
  // real charges are happening during a demo.
  // eslint-disable-next-line no-console
  console.log('💳 Payments running in MOCK mode — no real money moves. Set PAYMENT_MODE=live to use WaafiPay.');
}

module.exports = provider;
