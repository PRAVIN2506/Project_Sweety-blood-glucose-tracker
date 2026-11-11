import { Router } from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
    dailyReport,
    monthToDateReport,
    monthlyReport,
} from "../controllers/report.controller.js";

import { reportQuerySchema } from "../validators/report.validator.js";

const router = Router();

const validateReportQuery = (req, res, next) => {
    const result = reportQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid report date.",
            errors: result.error.issues,
        });
    }

    // Store validated data separately instead of modifying req.query.
    res.locals.validatedQuery = result.data;

    next();
};

router.use(protect);
router.use(validateReportQuery);

router.get("/daily", dailyReport);
router.get("/month-to-date", monthToDateReport);
router.get("/monthly", monthlyReport);

export default router;