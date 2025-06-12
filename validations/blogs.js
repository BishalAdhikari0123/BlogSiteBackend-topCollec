import Joi from "joi";

const blogValidation = {
  create: Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required()
      .messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 5 characters",
        "string.max": "Title must be at most 100 characters",
      }),

    content: Joi.string()
      .min(20)
      .required()
      .messages({
        "string.empty": "Content is required",
        "string.min": "Content must be at least 20 characters",
      }),

    tags: Joi.array()
      .items(Joi.string().min(1).max(20))
      .optional()
      .messages({
        "array.includes": "Each tag must be a string between 1 and 20 characters",
      }),

    coverImage: Joi.string()
      .uri()
      .allow("")
      .optional()
      .messages({
        "string.uri": "Cover image must be a valid URL",
      }),

    isPublished: Joi.boolean()
      .optional()
      .messages({
        "boolean.base": "isPublished must be true or false",
      }),
  }),
};

export default blogValidation;
