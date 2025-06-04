export default function contributorSecurity(req, res, next) {
	if (req.user && req.user.isContributor) {
		req.user.isAdmin = true; // Temporarily set isAdmin to true for contributors
		next();
	} else {
		next();
	}
}