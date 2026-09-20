const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.WAAFI_BASE_URL; // sandbox or production /asm endpoint

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

const nowTimestamp = () => new Date().toISOString().replace('T', ' ').substring(0, 23);

/**
 * Normalize a phone number to WaafiPay's required format:
 * full international format, no leading '+', no leading zeros.
 */
const normalizeAccountNo = (raw) => {
  if (!raw) throw new Error('Payer account number (phone) is required');
  let clean = String(raw).trim().replace(/[^\d]/g, '');
  if (clean.startsWith('0')) clean = clean.replace(/^0+/, '');
  if (!clean.startsWith('252') && clean.length <= 9) {
    // assume local Somali number without country code
    clean = `252${clean}`;
  }
  return clean;
};

/**
 * Charge a customer's mobile wallet.
 * @param {Object} params
 * @param {string} params.accountNo - customer phone number
 * @param {number} params.amount - amount to charge (2 decimal places)
 * @param {string} params.referenceId - our internal unique reference (order/enrollment ref)
 * @param {string} [params.invoiceId] - defaults to referenceId
 * @param {string} [params.currency] - defaults to WAAFI_DEFAULT_CURRENCY
 * @param {string} [params.description]
 */
const purchase = async ({ accountNo, amount, referenceId, invoiceId, currency, description }) => {
  const payload = {
    schemaVersion: '1.0',
    requestId: uuidv4(),
    timestamp: nowTimestamp(),
    channelName: 'WEB',
    serviceName: 'API_PURCHASE',
    serviceParams: {
      merchantUid: process.env.WAAFI_MERCHANT_UID,
      apiUserId: process.env.WAAFI_API_USER_ID,
      apiKey: process.env.WAAFI_API_KEY,
      paymentMethod: 'MWALLET_ACCOUNT',
      payerInfo: {
        accountNo: normalizeAccountNo(accountNo),
      },
      transactionInfo: {
        referenceId,
        invoiceId: invoiceId || referenceId,
        amount: Number(amount).toFixed(2),
        currency: currency || process.env.WAAFI_DEFAULT_CURRENCY || 'USD',
        description: description || 'SkillSprint course enrollment',
      },
    },
  };

  const { data } = await client.post('', payload);

  const success = data.responseCode === '2001' && data.params?.state === 'APPROVED';

  return {
    raw: data,
    success,
    state: data.params?.state,
    responseMsg: data.responseMsg,
    errorCode: data.errorCode,
    transactionId: data.params?.transactionId,
    issuerTransactionId: data.params?.issuerTransactionId,
    accountNo: data.params?.accountNo,
    accountType: data.params?.accountType,
    txAmount: data.params?.txAmount,
    referenceId: data.params?.referenceId,
  };
};

/**
 * Reverse (cancel) a purchase made within the last 24h and not yet settled.
 * @param {Object} params
 * @param {string} params.transactionId - the WaafiPay transactionId from the purchase response
 * @param {string} [params.description]
 */
const reverse = async ({ transactionId, description }) => {
  const payload = {
    schemaVersion: '1.0',
    requestId: uuidv4(),
    timestamp: nowTimestamp(),
    channelName: 'WEB',
    serviceName: 'API_REVERSAL',
    serviceParams: {
      merchantUid: process.env.WAAFI_MERCHANT_UID,
      apiUserId: process.env.WAAFI_API_USER_ID,
      apiKey: process.env.WAAFI_API_KEY,
      transactionId,
      description: description || 'Enrollment revoked/refunded',
    },
  };

  const { data } = await client.post('', payload);
  const success = data.responseCode === '2001';

  return { raw: data, success, state: data.params?.state, responseMsg: data.responseMsg };
};

module.exports = { purchase, reverse, normalizeAccountNo };
