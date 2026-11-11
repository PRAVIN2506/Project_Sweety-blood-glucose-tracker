import express from "express";

import {
    register,
    login,
    me,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import {
    registerSchema,
    loginSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    req.body = result.data;
    next();
};

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", protect, me);

export default router;
