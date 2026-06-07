import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import logger from "../lib/logger.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Skip authentication for identified public routes
    if (req.isPublicRoute) {
      return next();
    }

    const token = req.cookies.jwt;

    // Handle missing token gracefully - treat as normal request
    if (!token) {
      logger.info('Request without token (expected for public routes)', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Only log warnings for real security issues (invalid/expired tokens)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
        logger.warn('Invalid token detected - malformed payload', {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ message: "Unauthorized - Invalid Token" });
      }

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        logger.warn('Invalid token detected - user not found', {
          userId: decoded.userId,
          ip: req.ip
        });
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Log only real JWT verification failures as security warnings
      logger.warn('Invalid token detected - JWT verification failed', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
  } catch (error) {
    logger.error('Error in protectRoute middleware', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
