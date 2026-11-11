import {
    createReading,
    getReadings,
    getReadingById,
    updateReading,
    deleteReading,
} from "../services/reading.service.js";

export const addReading = async (req, res, next) => {
    try {
        const reading = await createReading(
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Glucose reading added successfully.",
            data: { reading },
        });
    } catch (error) {
        next(error);
    }
};

export const listReadings = async (req, res, next) => {
    try {
        const readings = await getReadings(req.user.userId);

        return res.status(200).json({
            success: true,
            count: readings.length,
            data: { readings },
        });
    } catch (error) {
        next(error);
    }
};

export const getReading = async (req, res, next) => {
    try {
        const reading = await getReadingById(
            req.user.userId,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: { reading },
        });
    } catch (error) {
        next(error);
    }
};

export const editReading = async (req, res, next) => {
    try {
        const reading = await updateReading(
            req.user.userId,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Glucose reading updated successfully.",
            data: { reading },
        });
    } catch (error) {
        next(error);
    }
};

export const removeReading = async (req, res, next) => {
    try {
        const result = await deleteReading(
            req.user.userId,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};
