import rateLimit from "express-rate-limit";

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 10000 : 100, // limit each IP to 100 requests per windowMs in prod, 10000 in dev
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints (relaxed in development)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 1000 : 5, // limit each IP to 5 auth requests in prod, 1000 in dev
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Message rate limiting
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "development" ? 1000 : 30, // limit each IP to 30 messages per minute in prod, 1000 in dev
  message: {
    message: "Too many messages, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

