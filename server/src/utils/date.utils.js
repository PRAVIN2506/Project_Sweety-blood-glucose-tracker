const slotLabels = {
    MORNING: "Morning",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

export const toDatabaseDate = (date) =>
    new Date(`${date}T00:00:00.000Z`);

export const getDateString = (date) =>
    date.toISOString().slice(0, 10);

export const getSlotLabel = (slot) =>
    slotLabels[slot] || slot;

/**
 * Validates that an IANA timezone identifier is valid according to Intl API.
 * @param {string} timeZone
 * @returns {boolean}
 */
export const isValidTimeZone = (timeZone) => {
    if (typeof timeZone !== "string" || !timeZone.trim()) {
        return false;
    }
    try {
        Intl.DateTimeFormat(undefined, { timeZone });
        return true;
    } catch {
        return false;
    }
};

/**
 * Returns the current calendar date formatted as YYYY-MM-DD in the given timezone.
 * Uses Intl.DateTimeFormat and formatToParts.
 * @param {string} timeZone - Valid IANA timezone identifier
 * @param {Date} [now=new Date()] - Reference date object
 * @returns {string} - YYYY-MM-DD
 */
export const getCalendarDate = (timeZone = "UTC", now = new Date()) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(now);
    const dateMap = {};
    for (const part of parts) {
        dateMap[part.type] = part.value;
    }

    return `${dateMap.year}-${dateMap.month}-${dateMap.day}`;
};

/**
 * Validates that a date string (YYYY-MM-DD) is not in the future for the given timezone.
 * @param {string} date - YYYY-MM-DD
 * @param {string} [timeZone="UTC"]
 * @param {Date} [now=new Date()]
 */
export const validateNotFutureDate = (date, timeZone = "UTC", now = new Date()) => {
    if (!isValidTimeZone(timeZone)) {
        const error = new Error("Invalid timezone identifier.");
        error.statusCode = 400;
        throw error;
    }

    const todayInZone = getCalendarDate(timeZone, now);

    if (date > todayInZone) {
        const error = new Error("Date cannot be in the future.");
        error.statusCode = 400;
        throw error;
    }
};
