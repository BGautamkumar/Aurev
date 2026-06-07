import logger from "../lib/logger.js";

// Middleware to identify public routes that don't require authentication
export const isPublicRoute = (req, res, next) => {
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/signup', 
    '/api/auth/logout',
    '/health'
  ];
  
  const isPublic = publicPaths.some(path => req.path.startsWith(path));
  
  if (isPublic) {
    logger.debug('Public route accessed - auth check skipped', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }
  
  req.isPublicRoute = isPublic;
  next();
};
