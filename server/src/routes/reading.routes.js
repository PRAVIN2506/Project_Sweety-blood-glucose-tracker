import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
    addReading,
    listReadings,
    getReading,
    editReading,
    removeReading,
} from "../controllers/reading.controller.js";

import {
    createReadingSchema,
    updateReadingSchema,
} from "../validators/reading.validator.js";

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

router.use(protect);

router.post("/", validate(createReadingSchema), addReading);

router.get("/", listReadings);

router.get("/:id", getReading);

router.put("/:id", validate(updateReadingSchema), editReading);

router.delete("/:id", removeReading);

export default router;
