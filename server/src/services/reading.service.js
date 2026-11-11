import prisma from "../config/database.js";

const slotLabels = {
    MORNING: "Morning",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

// Convert YYYY-MM-DD into a UTC date-only value.
// This avoids local timezone shifting.
const toDatabaseDate = (date) => {
    return new Date(`${date}T00:00:00.000Z`);
};

const getSlotLabel = (slot) => slotLabels[slot] || slot;

const validateNotFutureDate = (date) => {
    const today = new Date().toISOString().slice(0, 10);

    if (date > today) {
        const error = new Error("Date cannot be in the future.");
        error.statusCode = 400;
        throw error;
    }
};

const validateReadingLimit = async (
    userId,
    date,
    excludeReadingId = null
) => {
    const readingDate = toDatabaseDate(date);

    const readings = await prisma.reading.findMany({
        where: {
            userId,
            date: readingDate,
            ...(excludeReadingId && {
                id: { not: excludeReadingId },
            }),
        },
    });

    if (readings.length >= 4) {
        const error = new Error(
            "You can add only 4 readings per day."
        );

        error.statusCode = 400;
        throw error;
    }
};

const validateDuplicateSlot = async (
    userId,
    date,
    slot,
    excludeReadingId = null
) => {
    const existingReading = await prisma.reading.findFirst({
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

    await validateDuplicateSlot(userId, date, slot);

    await validateReadingLimit(userId, date);

    return prisma.reading.create({
        data: {
            userId,
            date: toDatabaseDate(date),
            slot,
            value,
        },
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

export const updateReading = async (
    userId,
    readingId,
    data
) => {
    const existingReading = await getReadingById(
        userId,
        readingId
    );

    const newDate = data.date || existingReading.date
        .toISOString()
        .slice(0, 10);

    const newSlot = data.slot || existingReading.slot;

    validateNotFutureDate(newDate);

    await validateDuplicateSlot(
        userId,
        newDate,
        newSlot,
        readingId
    );

    if (newDate !== existingReading.date.toISOString().slice(0, 10)) {
        await validateReadingLimit(userId, newDate);
    }

    return prisma.reading.update({
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
};

export const deleteReading = async (userId, readingId) => {
    await getReadingById(userId, readingId);

    await prisma.reading.delete({
        where: { id: readingId },
    });

    return { message: "Reading deleted successfully." };
};
