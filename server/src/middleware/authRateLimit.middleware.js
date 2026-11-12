import { rateLimit } from "express-rate-limit";

const createAuthRateLimiter = (windowMs, limit, message) => {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                message,
            });
        },
    });
};

// Maximum 5 registration attempts per IP per hour.
export const registerRateLimiter = createAuthRateLimiter(
    60 * 60 * 1000,
    5,
    "Too many registration attempts. Please try again later."
);

// Maximum 10 login attempts per IP per 15 minutes.
export const loginRateLimiter = createAuthRateLimiter(
    15 * 60 * 1000,
    10,
    "Too many login attempts. Please try again after 15 minutes."
);
