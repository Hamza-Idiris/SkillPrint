const { v4: uuidv4 } = require('uuid');
const { normalizeAccountNo } = require('./waafiPayService');

/**
 * Mock payment provider — same function signatures/return shape as
 * waafiPayService, so enrollmentController doesn't need to know which one
 * it's talking to. No network calls, no real money — but it still performs
 * real validation and can be made to fail deterministically, so the whole
 * enroll/decline/retry flow is testable end-to-end.
 *
 * Test rules (based on the payer's phone number, after normalization):
 *   - ends with "0000"  -> declined: insufficient balance
 *   - ends with "1111"  -> declined: PIN not confirmed in time
 *   - ends with "2222"  -> declined: account not found
 *   - anything else     -> approved
 *
 * A short artificial delay is added so the frontend's "waiting for approval
 * on your phone" state behaves the same as it will against the real gateway.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DECLINE_RULES = {
  '0000': 'Insufficient balance in wallet.',
  '1111': 'Payment was not confirmed on the phone in time.',
  '2222': 'No wallet account found for this number.',
};

const purchase = async ({ accountNo, amount, referenceId, invoiceId, currency, description }) => {
  const normalized = normalizeAccountNo(accountNo); // throws if missing/invalid, same as live service

  if (!amount || Number(amount) <= 0) {
    throw new Error('Invalid amount');
  }

  await delay(900); // simulate the round-trip to a mobile money network

  const declineReason = Object.entries(DECLINE_RULES).find(([suffix]) => normalized.endsWith(suffix))?.[1];

  if (declineReason) {
    return {
      raw: { mock: true, reason: declineReason },
      success: false,
      state: 'DECLINED',
      responseMsg: declineReason,
      errorCode: 'E5405',
      transactionId: null,
      issuerTransactionId: null,
      accountNo: normalized,
      accountType: 'MWALLET_ACCOUNT',
      txAmount: Number(amount).toFixed(2),
      referenceId,
    };
  }

  const transactionId = `MOCK-${uuidv4().split('-')[0].toUpperCase()}`;

  return {
    raw: { mock: true },
    success: true,
    state: 'APPROVED',
    responseMsg: 'RCS_SUCCESS',
    errorCode: null,
    transactionId,
    issuerTransactionId: `ISS-${uuidv4().split('-')[0].toUpperCase()}`,
    accountNo: normalized,
    accountType: 'MWALLET_ACCOUNT',
    txAmount: Number(amount).toFixed(2),
    referenceId,
  };
};

const reverse = async ({ transactionId, description }) => {
  await delay(500);

  if (!transactionId) {
    throw new Error('transactionId is required to reverse a payment');
  }

  return {
    raw: { mock: true },
    success: true,
    state: 'REVERSED',
    responseMsg: 'RCS_SUCCESS',
  };
};

module.exports = { purchase, reverse, normalizeAccountNo };
