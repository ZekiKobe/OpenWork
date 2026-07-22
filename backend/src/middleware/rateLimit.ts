import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiter for login attempts to prevent brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // More lenient in development: 50 attempts, production: 5 attempts
  message: {
    error: 'Too many login attempts, please try again later.',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req): boolean => {
    // Skip rate limiting in development for localhost
    return isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1')) || false;
  }
});

// Rate limiter for registration attempts
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 20 : 3, // More lenient in development: 20 attempts, production: 3 attempts
  message: {
    error: 'Too many registration attempts, please try again later.',
    code: 'TOO_MANY_REG_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req): boolean => {
    // Skip rate limiting in development for localhost
    return isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1')) || false;
  }
});

// Rate limiter for password reset requests
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 password reset requests per windowMs
  message: {
    error: 'Too many password reset attempts, please try again later.',
    code: 'TOO_MANY_RESET_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter for authenticated users
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
    code: 'TOO_MANY_API_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for comment posting to prevent spam
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 comments per windowMs
  message: {
    error: 'Too many comments, please slow down.',
    code: 'TOO_MANY_COMMENTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for post creation to prevent spam
export const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 posts per windowMs
  message: {
    error: 'Too many posts, please slow down.',
    code: 'TOO_MANY_POSTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});