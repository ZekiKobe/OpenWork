describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    delete process.env.JWT_SECRET;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.FRONTEND_URL;
    delete process.env.JWT_EXPIRE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not throw in development when required vars are missing', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { validateEnv } = require('../config/env');

    expect(() => validateEnv()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('sets default JWT_EXPIRE when missing', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { validateEnv } = require('../config/env');

    validateEnv();

    expect(process.env.JWT_EXPIRE).toBe('15m');
  });
});
