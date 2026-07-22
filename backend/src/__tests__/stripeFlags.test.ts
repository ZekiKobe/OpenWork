describe('isPaymentsEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.PAYMENTS_ENABLED;
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns false when payments are disabled', () => {
    process.env.PAYMENTS_ENABLED = 'false';
    process.env.STRIPE_SECRET_KEY = 'sk_test_example';

    const { isPaymentsEnabled } = require('../services/stripePaymentService');
    expect(isPaymentsEnabled()).toBe(false);
  });

  it('returns false when Stripe secret key is missing', () => {
    process.env.PAYMENTS_ENABLED = 'true';

    const { isPaymentsEnabled } = require('../services/stripePaymentService');
    expect(isPaymentsEnabled()).toBe(false);
  });

  it('returns true when payments are enabled and Stripe key is set', () => {
    process.env.PAYMENTS_ENABLED = 'true';
    process.env.STRIPE_SECRET_KEY = 'sk_test_example';

    const { isPaymentsEnabled } = require('../services/stripePaymentService');
    expect(isPaymentsEnabled()).toBe(true);
  });
});
