const validate = function (validationSchemas = {}) {
    return function (req, res, next) {
        const { body, params, query, headers } = validationSchemas;
console.log("Validation middleware triggered");
        let validationResult;

        try {
            if (body) {
                validationResult = body.validate(req.body, { abortEarly: false });
                if (validationResult.error) throw validationResult.error;
            }

            if (params) {
                validationResult = params.validate(req.params, { abortEarly: false });
                if (validationResult.error) throw validationResult.error;
            }

            if (query) {
                validationResult = query.validate(req.query, { abortEarly: false });
                if (validationResult.error) throw validationResult.error;
            }

            if (headers) {
                validationResult = headers.validate(req.headers, { abortEarly: false });
                if (validationResult.error) throw validationResult.error;
            }

            // If all validations pass
            next();
        } catch (error) {
            console.log("Validation error:", error);
            return res.status(400).json({
  success: false,
  message: "Validation failed",
  errors: error.details.map((detail) => detail.message),
});

        }
    };
};

export default validate;