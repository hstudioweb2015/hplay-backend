import ValidationError from "../errors/ValidationError.js";

/**
 * Middleware to validate request body
 * @description This middleware checks if the request body matches the schema
 * @param schema {{parameterName: {type: string, required: boolean, minLength: number, format: string}}} - The schema to validate against
 */
export default function validateRequest(schema) {

	// Check if request body exists
	return (req, res, next) => {

		// add params to the request body
		if (req.params) {
			if (!req.body) req.body = {};
			for (const [key, value] of Object.entries(req.params)) {
				if (req.body[key] === undefined) {
					req.body[key] = value;
				}
			}
		}

		// Check if request body is an object
		if (!req.body || typeof req.body !== "object") {
			//check if one rule is required
			if (Object.values(schema).some(rule => rule.required)) {
				return res.status(400).json({errors: ["Request body is missing or malformed."]});
			} else {
				return next();
			}
		}

		const errors = [];

		for (const [key, rules] of Object.entries(schema)) {
			const value = req.body[key];

			// Check if the key is in the schema
			if (rules.required && (value === undefined || value === null || value === "")) {
				errors.push(`${key} is required.`);
				continue;
			}

			// Check if the key is in the request body
			if (value === undefined || value === null) continue;

			// Check type
			if (rules.type && typeof value !== rules.type) {
				errors.push(`${key} must be a ${rules.type}.`);
				continue;
			}

			// Check minLength
			if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
				errors.push(`${key} must be at least ${rules.minLength} characters long.`);
			}

			// Check email format
			if (rules.format === "email" && typeof value === "string") {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					errors.push(`${key} must be a valid email address.`);
				}
			}
		}

		if (errors.length > 0) {
			return next(new ValidationError(errors));
		}

		next();
	};
}
