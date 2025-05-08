import AppError from "../errors/AppError.js";

export default function adminSecurity(req, res, next) {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		next(new AppError('Not authorized', 'You do not have permission to perform this action.', 403));
	}
}