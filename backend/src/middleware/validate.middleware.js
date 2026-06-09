import Joi from "joi";

// Common validation schemas
const schemas = {
  auth: {
    signup: Joi.object({
      fullName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    forgotPassword: Joi.object({
      email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
      password: Joi.string().min(6).max(128).required(),
    }),
  },
  message: {
    send: Joi.object({
      receiverId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      text: Joi.string().max(1000).allow(""),
      image: Joi.string().allow("", null),
    }),
    getMessages: Joi.object({
      id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    }),
  },
  profile: {
    update: Joi.object({
      profilePic: Joi.string().allow("", null),
      fullName: Joi.string().min(2).max(50).allow("", null),
      privacy: Joi.object({
        showOnlineStatus: Joi.boolean(),
        allowDMsFrom: Joi.string().valid("friends", "everyone", "nobody"),
        profileVisibility: Joi.string().valid("public", "friends", "private"),
        readReceipts: Joi.boolean(),
      }),
    }).min(1),
  },
};

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map(detail => detail.message),
      });
    }
    next();
  };
};

// Validation middleware for params
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map(detail => detail.message),
      });
    }
    next();
  };
};

export { schemas };
