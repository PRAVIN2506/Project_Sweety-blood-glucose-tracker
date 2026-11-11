import prisma from "../config/database.js";

const toDatabaseDate = (date) => {
    return new Date(`${date}T00:00:00.000Z`);
};

const formatDate = (date) => {
    return date.toISOString().slice(0, 10);
};

const getDailyRange = (date) => ({
    startDate: date,
    endDate: date,
});

const getMonthToDateRange = (date) => {
    const selectedDate = toDatabaseDate(date);

    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();

    const start = new Date(Date.UTC(year, month, 1));

    return {
        startDate: formatDate(start),
        endDate: date,
    };
};

const getPreviousMonthRange = (date) => {
    const selectedDate = toDatabaseDate(date);

    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));

    return {
        startDate: formatDate(start),
        endDate: formatDate(end),
    };
};

const slotOrder = {
    MORNING: 1,
    AFTER_BREAKFAST: 2,
    AFTER_LUNCH: 3,
    AFTER_DINNER: 4,
};

const getReportData = async (userId, startDate, endDate) => {
    const where = {
        userId,
        date: {
            gte: toDatabaseDate(startDate),
            lte: toDatabaseDate(endDate),
        },
    };

    const [aggregate, readings] = await Promise.all([
        prisma.reading.aggregate({
            where,
            _max: { value: true },
            _min: { value: true },
            _avg: { value: true },
            _count: { _all: true },
        }),

        prisma.reading.findMany({
            where,
        }),
    ]);

    readings.sort((a, b) => {
        const dateDifference = a.date.getTime() - b.date.getTime();

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return slotOrder[a.slot] - slotOrder[b.slot];
    });

    return {
        startDate,
        endDate,
        highest: aggregate._max.value,
        lowest: aggregate._min.value,
        average:
            aggregate._avg.value === null
                ? null
                : Number(aggregate._avg.value.toFixed(1)),
        count: aggregate._count._all,
        readings: readings.map((reading) => ({
            id: reading.id,
            date: formatDate(reading.date),
            slot: reading.slot,
            value: reading.value,
        })),
    };
};

export const getDailyReport = async (userId, date) => {
    const range = getDailyRange(date);

    return getReportData(userId, range.startDate, range.endDate);
};

export const getMonthToDateReport = async (userId, date) => {
    const range = getMonthToDateRange(date);

    return getReportData(userId, range.startDate, range.endDate);
};

export const getMonthlyReport = async (userId, date) => {
    const range = getPreviousMonthRange(date);

    return getReportData(userId, range.startDate, range.endDate);
};