const REQUIRED_IN_PRODUCTION = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'FRONTEND_URL'
];

const WEAK_SECRETS = [
  'your-super-secret-jwt-key-here-change-in-production',
  'change-me-to-a-long-random-secret-in-production',
  'secret',
  'jwt_secret'
];

export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const missing: string[] = [];

  for (const key of REQUIRED_IN_PRODUCTION) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (isProd && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProd) {
    const jwt = process.env.JWT_SECRET || '';
    if (WEAK_SECRETS.includes(jwt) || jwt.length < 32) {
      throw new Error('JWT_SECRET must be a strong secret (32+ chars) in production');
    }
  } else if (missing.length > 0) {
    console.warn(`[env] Missing recommended vars: ${missing.join(', ')}`);
  }

  if (!process.env.JWT_EXPIRE) {
    process.env.JWT_EXPIRE = '15m';
  }
}
