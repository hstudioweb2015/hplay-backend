export default function validateRequest(schema) {
	return (req, res, next) => {
		const errors = [];

		for (const [field, rules] of Object.entries(schema)) {
			const value = req.body[field];

			if (rules.required && (value === undefined || value === null || value === "")) {
				errors.push(`${field} is required`);
				continue;
			}

			if (rules.type && typeof value !== rules.type) {
				errors.push(`${field} must be of type ${rules.type}`);
			}

			if (rules.format === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
				errors.push(`${field} must be a valid email`);
			}

			if (rules.minLength && value && value.length < rules.minLength) {
				errors.push(`${field} must be at least ${rules.minLength} characters long`);
			}
		}

		if (errors.length > 0) {
			return res.status(400).json({ message: "Validation error", errors });
		}

		next();
	};
}