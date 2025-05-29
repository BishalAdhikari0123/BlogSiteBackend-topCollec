import Joi from "joi";

const userValidation = {
  register: Joi.object({
    username: Joi.string()
      .min(5)
      .max(15)
      .required()
      .messages({
        "string.empty": "Username is required",
        "string.min": "Username must be at least 5 characters",
        "string.max": "Username must be at most 15 characters",
      }),
    password: Joi.string()
      .min(7)
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 7 characters",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
      }),
    bio: Joi.string().min(10).max(200).optional(),
    profileImage: Joi.string().allow("").optional(),
  }),

  verifyEmail: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
      }),
    otp: Joi.string()
      .required()
      .messages({
        "string.empty": "OTP is required",
      }),
  }),
};

export default userValidation;
