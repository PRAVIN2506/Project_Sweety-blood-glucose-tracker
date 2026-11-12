import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { registerUser } from "../src/services/auth.service.js";

const BASE_URL = "/api/reports";
const SELECTED_DATE = "2026-11-12";

const createUser = async () => {
    const result = await registerUser({
        name: "Report Test User",
        email: `report-${randomUUID()}@example.com`,
        password: "StrongPass123",
    });

    return {
        id: result.user.id,
        token: result.token,
    };
};

const insertReading = (userId, date, slot, value) =>
    prisma.reading.create({
        data: {
            userId,
            date: new Date(`${date}T00:00:00.000Z`),
            slot,
            value,
        },
    });

const clearData = async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
};

describe("Reports API", () => {
    let user;
    let otherUser;

    beforeEach(async () => {
        await clearData();

        user = await createUser();
        otherUser = await createUser();

        // Selected date: November 12
        await insertReading(
            user.id,
            "2026-11-12",
            "MORNING",
            100
        );

        await insertReading(
            user.id,
            "2026-11-12",
            "AFTER_BREAKFAST",
            151
        );

        // Earlier in November
        await insertReading(
            user.id,
            "2026-11-01",
            "MORNING",
            111
        );

        // Previous month: October
        await insertReading(
            user.id,
            "2026-10-01",
            "MORNING",
            80
        );

        await insertReading(
            user.id,
            "2026-10-31",
            "AFTER_DINNER",
            120
        );

        // Another user's reading must not affect reports.
        await insertReading(
            otherUser.id,
            "2026-11-12",
            "MORNING",
            500
        );
    });

    afterEach(async () => {
        await clearData();
    });

    test("requires authentication", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .query({ date: SELECTED_DATE });

        expect(response.status).toBe(401);
    });

    test("returns daily report for the selected date", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: SELECTED_DATE });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const report = response.body.data;

        expect(report.startDate).toBe(SELECTED_DATE);
        expect(report.endDate).toBe(SELECTED_DATE);
        expect(report.count).toBe(2);
        expect(report.highest).toBe(151);
        expect(report.lowest).toBe(100);
        expect(report.average).toBe(125.5);

        expect(report.readings).toHaveLength(2);
        expect(
            report.readings.every(
                (reading) => reading.date === SELECTED_DATE
            )
        ).toBe(true);
    });

    test("returns month-to-date report", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/month-to-date`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: SELECTED_DATE });

        expect(response.status).toBe(200);

        const report = response.body.data;

        expect(report.startDate).toBe("2026-11-01");
        expect(report.endDate).toBe(SELECTED_DATE);
        expect(report.count).toBe(3);
        expect(report.highest).toBe(151);
        expect(report.lowest).toBe(100);
        expect(report.average).toBe(120.7);

        expect(
            report.readings.every(
                (reading) => reading.date.startsWith("2026-11")
            )
        ).toBe(true);
    });

    test("returns the complete previous calendar month", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/monthly`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: SELECTED_DATE });

        expect(response.status).toBe(200);

        const report = response.body.data;

        expect(report.startDate).toBe("2026-10-01");
        expect(report.endDate).toBe("2026-10-31");
        expect(report.count).toBe(2);
        expect(report.highest).toBe(120);
        expect(report.lowest).toBe(80);
        expect(report.average).toBe(100);

        expect(
            report.readings.every(
                (reading) => reading.date.startsWith("2026-10")
            )
        ).toBe(true);
    });

    test("returns a friendly empty state when no readings exist", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: "2026-11-11" });

        expect(response.status).toBe(200);
        expect(response.body.data.count).toBe(0);
        expect(response.body.data.highest).toBeNull();
        expect(response.body.data.lowest).toBeNull();
        expect(response.body.data.average).toBeNull();
        expect(response.body.data.readings).toEqual([]);
        expect(response.body.message).toBe(
            "No readings found for this date."
        );
    });

    test("rejects a missing report date", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .set("Authorization", `Bearer ${user.token}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects an invalid report date", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: "not-a-date" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("does not include another user's readings", async () => {
        const response = await request(app)
            .get(`${BASE_URL}/daily`)
            .set("Authorization", `Bearer ${user.token}`)
            .query({ date: SELECTED_DATE });

        expect(response.status).toBe(200);
        expect(response.body.data.count).toBe(2);
        expect(response.body.data.highest).toBe(151);
        expect(
            response.body.data.readings.every(
                (reading) => reading.value !== 500
            )
        ).toBe(true);
    });
});
