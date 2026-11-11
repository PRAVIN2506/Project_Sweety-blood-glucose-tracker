import { z } from "zod";

const readingSlots = [
    "MORNING",
    "AFTER_BREAKFAST",
    "AFTER_LUNCH",
    "AFTER_DINNER",
];

export const createReadingSchema = z.object({
    date: z.iso.date({
        error: "Please provide a valid date.",
    }),

    slot: z.enum(readingSlots, {
        error: "Please select a valid reading slot.",
    }),

    value: z
        .number({
            error: "Please enter a glucose value.",
        })
        .int("Glucose value must be a whole number.")
        .min(40, "Value must be between 40 and 600 mg/dl.")
        .max(600, "Value must be between 40 and 600 mg/dl."),
});

export const updateReadingSchema = z.object({
    date: z.iso.date({
        error: "Please provide a valid date.",
    }).optional(),

    slot: z.enum(readingSlots, {
        error: "Please select a valid reading slot.",
    }).optional(),

    value: z
        .number({
            error: "Please enter a glucose value.",
        })
        .int("Glucose value must be a whole number.")
        .min(40, "Value must be between 40 and 600 mg/dl.")
        .max(600, "Value must be between 40 and 600 mg/dl.")
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided.",
    }
);
