const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minutes
	max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = limiter