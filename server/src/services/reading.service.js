import prisma from "../config/database.js";

const slotLabels = {
    MORNING: "Morning",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

const toDatabaseDate = (date) =>
    new Date(`${date}T00:00:00.000Z`);

const getDateString = (date) =>
    date.toISOString().slice(0, 10);

const getSlotLabel = (slot) =>
    slotLabels[slot] || slot;

const validateNotFutureDate = (date) => {
    const today = new Date().toISOString().slice(0, 10);

    if (date > today) {
        const error = new Error("Date cannot be in the future.");
        error.statusCode = 400;
        throw error;
    }
};

// Acquire a transaction-scoped PostgreSQL advisory lock.
// The CTE returns an integer so Prisma can safely read the result.
const acquireAdvisoryLock = async (tx, key) => {
    await tx.$queryRaw`
        WITH acquired AS (
            SELECT pg_advisory_xact_lock(
                hashtextextended(${key}, 0)
            )
        )
        SELECT 1 AS locked FROM acquired
    `;
};

const acquireDayLocks = async (tx, userId, dates) => {
    const uniqueDates = [...new Set(dates)].sort();

    for (const date of uniqueDates) {
        await acquireAdvisoryLock(
            tx,
            `day:${userId}:${date}`
        );
    }
};

const validateReadingLimit = async (
    tx,
    userId,
    date,
    excludeReadingId = null
) => {
    const count = await tx.reading.count({
        where: {
            userId,
            date: toDatabaseDate(date),
            ...(excludeReadingId && {
                id: { not: excludeReadingId },
            }),
        },
    });

    if (count >= 4) {
        const error = new Error(
            "You can add only 4 readings per day."
        );
        error.statusCode = 400;
        throw error;
    }
};

const validateDuplicateSlot = async (
    tx,
    userId,
    date,
    slot,
    excludeReadingId = null
) => {
    const existingReading = await tx.reading.findFirst({
        where: {
            userId,
            date: toDatabaseDate(date),
            slot,
            ...(excludeReadingId && {
                id: { not: excludeReadingId },
            }),
        },
    });

    if (existingReading) {
        const error = new Error(
            `You already have a ${getSlotLabel(slot)} reading for this date.`
        );
        error.statusCode = 409;
        throw error;
    }
};

export const createReading = async (userId, data) => {
    const { date, slot, value } = data;

    validateNotFutureDate(date);

    return prisma.$transaction(async (tx) => {
        await acquireDayLocks(tx, userId, [date]);

        await validateDuplicateSlot(tx, userId, date, slot);
        await validateReadingLimit(tx, userId, date);

        return tx.reading.create({
            data: {
                userId,
                date: toDatabaseDate(date),
                slot,
                value,
            },
        });
    });
};

export const getReadings = async (userId) => {
    return prisma.reading.findMany({
        where: { userId },
        orderBy: [
            { date: "desc" },
            { slot: "asc" },
        ],
    });
};

export const getReadingById = async (userId, readingId) => {
    const reading = await prisma.reading.findFirst({
        where: {
            id: readingId,
            userId,
        },
    });

    if (!reading) {
        const error = new Error("Reading not found.");
        error.statusCode = 404;
        throw error;
    }

    return reading;
};

export const updateReading = async (userId, readingId, data) => {
    return prisma.$transaction(async (tx) => {
        await acquireAdvisoryLock(
            tx,
            `reading:${userId}:${readingId}`
        );

        const existingReading = await tx.reading.findFirst({
            where: {
                id: readingId,
                userId,
            },
        });

        if (!existingReading) {
            const error = new Error("Reading not found.");
            error.statusCode = 404;
            throw error;
        }

        const oldDate = getDateString(existingReading.date);
        const newDate = data.date || oldDate;
        const newSlot = data.slot || existingReading.slot;

        validateNotFutureDate(newDate);

        await acquireDayLocks(tx, userId, [oldDate, newDate]);

        await validateDuplicateSlot(
            tx,
            userId,
            newDate,
            newSlot,
            readingId
        );

        await validateReadingLimit(
            tx,
            userId,
            newDate,
            readingId
        );

        return tx.reading.update({
            where: { id: readingId },
            data: {
                ...(data.date && {
                    date: toDatabaseDate(data.date),
                }),
                ...(data.slot && {
                    slot: data.slot,
                }),
                ...(data.value !== undefined && {
                    value: data.value,
                }),
            },
        });
    });
};

export const deleteReading = async (userId, readingId) => {
    return prisma.$transaction(async (tx) => {
        await acquireAdvisoryLock(
            tx,
            `reading:${userId}:${readingId}`
        );

        const existingReading = await tx.reading.findFirst({
            where: {
                id: readingId,
                userId,
            },
        });

        if (!existingReading) {
            const error = new Error("Reading not found.");
            error.statusCode = 404;
            throw error;
        }

        const readingDate = getDateString(existingReading.date);

        await acquireDayLocks(tx, userId, [readingDate]);

        await tx.reading.delete({
            where: {
                id: readingId,
            },
        });

        return {
            message: "Reading deleted successfully.",
        };
    });
};