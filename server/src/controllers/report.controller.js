import {
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport,
} from "../services/report.service.js";

export const dailyReport = async (req, res, next) => {
    try {
        const report = await getDailyReport(
            req.user.userId,
            req.query.date
        );

        return res.status(200).json({
            success: true,
            message:
                report.count === 0
                    ? "No readings found for this date."
                    : "Daily report retrieved successfully.",
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

export const monthToDateReport = async (req, res, next) => {
    try {
        const report = await getMonthToDateReport(
            req.user.userId,
            req.query.date
        );

        return res.status(200).json({
            success: true,
            message:
                report.count === 0
                    ? "No readings found for this period."
                    : "Month-to-date report retrieved successfully.",
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

export const monthlyReport = async (req, res, next) => {
    try {
        const report = await getMonthlyReport(
            req.user.userId,
            req.query.date
        );

        return res.status(200).json({
            success: true,
            message:
                report.count === 0
                    ? "No readings found for this month."
                    : "Monthly report retrieved successfully.",
            data: report,
        });
    } catch (error) {
        next(error);
    }
};