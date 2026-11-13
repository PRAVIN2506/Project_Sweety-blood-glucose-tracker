import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { registerUser } from "../src/services/auth.service.js";

const BASE_URL = "/api/readings";
const TEST_DATE = "2026-11-10";
const SECOND_DATE = "2026-11-09";

const slots = [
    "MORNING",
    "AFTER_BREAKFAST",
    "AFTER_LUNCH",
    "AFTER_DINNER",
];

const createUser = async () => {
    const result = await registerUser({
        name: "Reading Test User",
        email: `reading-${randomUUID()}@example.com`,
        password: "StrongPass123",
    });

    return result.token;
};

const createReading = (token, data, headers = {}) => {
    const req = request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

    for (const [key, val] of Object.entries(headers)) {
        req.set(key, val);
    }

    return req.send(data);
};

const readingInput = (
    slot = "MORNING",
    value = 110,
    date = TEST_DATE
) => ({
    date,
    slot,
    value,
});

const clearData = async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
};

describe("Reading API", () => {
    let token;

    beforeEach(async () => {
        await clearData();
        token = await createUser();
    });

    afterEach(async () => {
        await clearData();
    });

    test("requires authentication", async () => {
        const response = await request(app).get(BASE_URL);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("creates and lists readings", async () => {
        const created = await createReading(
            token,
            readingInput()
        );

        expect(created.status).toBe(201);
        expect(created.body.data.reading.value).toBe(110);

        const listed = await request(app)
            .get(BASE_URL)
            .set("Authorization", `Bearer ${token}`);

        expect(listed.status).toBe(200);
        expect(listed.body.count).toBe(1);
        expect(listed.body.data.readings).toHaveLength(1);
    });

    test("retrieves a reading by ID", async () => {
        const created = await createReading(
            token,
            readingInput()
        );

        const id = created.body.data.reading.id;

        const response = await request(app)
            .get(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.reading.id).toBe(id);
    });

    test("rejects a duplicate slot on the same date", async () => {
        const first = await createReading(
            token,
            readingInput()
        );

        const second = await createReading(
            token,
            readingInput("MORNING", 125)
        );

        expect(first.status).toBe(201);
        expect(second.status).toBe(409);
    });

    test.each([39, 601, 110.5])(
        "rejects invalid glucose value %s",
        async (value) => {
            const response = await createReading(
                token,
                readingInput("MORNING", value)
            );

            expect(response.status).toBe(400);
        }
    );

    test("rejects future dates", async () => {
        const response = await createReading(
            token,
            readingInput("MORNING", 110, "2099-01-01")
        );

        expect(response.status).toBe(400);
    });

    test("allows four slots but never a fifth reading", async () => {
        for (const [index, slot] of slots.entries()) {
            const response = await createReading(
                token,
                readingInput(slot, 100 + index)
            );

            expect(response.status).toBe(201);
        }

        const fifth = await createReading(
            token,
            readingInput("MORNING", 140)
        );

        expect([400, 409]).toContain(fifth.status);

        const listed = await request(app)
            .get(BASE_URL)
            .set("Authorization", `Bearer ${token}`);

        expect(listed.body.count).toBe(4);
    });

    test("updates an existing reading", async () => {
        const created = await createReading(
            token,
            readingInput()
        );

        const id = created.body.data.reading.id;

        const response = await request(app)
            .put(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                value: 145,
                slot: "AFTER_BREAKFAST",
            });

        expect(response.status).toBe(200);
        expect(response.body.data.reading.value).toBe(145);
        expect(response.body.data.reading.slot).toBe(
            "AFTER_BREAKFAST"
        );
    });

    test("moves a reading to another date", async () => {
        const created = await createReading(
            token,
            readingInput()
        );

        const id = created.body.data.reading.id;

        const response = await request(app)
            .put(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ date: SECOND_DATE });

        expect(response.status).toBe(200);
        expect(response.body.data.reading.date).toContain(
            SECOND_DATE
        );
    });

    test("deletes an existing reading", async () => {
        const created = await createReading(
            token,
            readingInput()
        );

        const id = created.body.data.reading.id;

        const deleted = await request(app)
            .delete(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleted.status).toBe(200);

        const retrieved = await request(app)
            .get(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(retrieved.status).toBe(404);
    });

    test("prevents one user from accessing another user's readings", async () => {
        const otherToken = await createUser();

        const created = await createReading(
            token,
            readingInput()
        );

        const id = created.body.data.reading.id;

        const otherList = await request(app)
            .get(BASE_URL)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(otherList.status).toBe(200);
        expect(otherList.body.count).toBe(0);

        const otherGet = await request(app)
            .get(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${otherToken}`);

        const otherUpdate = await request(app)
            .put(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ value: 200 });

        const otherDelete = await request(app)
            .delete(`${BASE_URL}/${id}`)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(otherGet.status).toBe(404);
        expect(otherUpdate.status).toBe(404);
        expect(otherDelete.status).toBe(404);
    });

    test("serializes simultaneous requests for the same slot", async () => {
        const [first, second] = await Promise.all([
            createReading(
                token,
                readingInput("MORNING", 110)
            ),
            createReading(
                token,
                readingInput("MORNING", 120)
            ),
        ]);

        const statuses = [
            first.status,
            second.status,
        ].sort((a, b) => a - b);

        expect(statuses).toEqual([201, 409]);

        const listed = await request(app)
            .get(BASE_URL)
            .set("Authorization", `Bearer ${token}`);

        expect(listed.body.count).toBe(1);
    });

    test("allows simultaneous writes on separate dates", async () => {
        const [first, second] = await Promise.all([
            createReading(
                token,
                readingInput("MORNING", 110, TEST_DATE)
            ),
            createReading(
                token,
                readingInput("MORNING", 120, SECOND_DATE)
            ),
        ]);

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);

        const listed = await request(app)
            .get(BASE_URL)
            .set("Authorization", `Bearer ${token}`);

        expect(listed.body.count).toBe(2);
    });

    describe("Timezone-aware future date validation", () => {
        // Deterministic clock: 2026-11-12T20:30:00.000Z
        // In UTC: 2026-11-12
        // In Asia/Kolkata (+05:30): 2026-11-13 02:00:00 -> Date is 2026-11-13
        // In America/New_York (-05:00): 2026-11-12 15:30:00 -> Date is 2026-11-12
        const FIXED_ISO = "2026-11-12T20:30:00.000Z";
        const RealDate = globalThis.Date;

        beforeEach(() => {
            class DeterministicDate extends RealDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super(FIXED_ISO);
                    } else {
                        super(...args);
                    }
                }
            }
            DeterministicDate.now = () => new RealDate(FIXED_ISO).getTime();
            DeterministicDate.UTC = RealDate.UTC;
            DeterministicDate.parse = RealDate.parse;

            globalThis.Date = DeterministicDate;
        });

        afterEach(() => {
            globalThis.Date = RealDate;
        });

        test("accepts India local date when UTC is still on the previous calendar day", async () => {
            // In Asia/Kolkata, date is 2026-11-13 (UTC is 2026-11-12)
            const response = await createReading(
                token,
                readingInput("MORNING", 105, "2026-11-13"),
                { "X-Time-Zone": "Asia/Kolkata" }
            );

            expect(response.status).toBe(201);
            expect(response.body.data.reading.value).toBe(105);
        });

        test("rejects tomorrow in India timezone (2026-11-14)", async () => {
            const response = await createReading(
                token,
                readingInput("MORNING", 105, "2026-11-14"),
                { "X-Time-Zone": "Asia/Kolkata" }
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Date cannot be in the future.");
        });

        test("rejects 2026-11-13 in America/New_York where local date is still 2026-11-12", async () => {
            const response = await createReading(
                token,
                readingInput("MORNING", 105, "2026-11-13"),
                { "X-Time-Zone": "America/New_York" }
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Date cannot be in the future.");
        });

        test("accepts today in America/New_York (2026-11-12)", async () => {
            const response = await createReading(
                token,
                readingInput("MORNING", 105, "2026-11-12"),
                { "X-Time-Zone": "America/New_York" }
            );

            expect(response.status).toBe(201);
        });

        test("falls back to UTC when X-Time-Zone header is absent", async () => {
            // In UTC, date is 2026-11-12
            const validUtc = await createReading(
                token,
                readingInput("MORNING", 105, "2026-11-12")
            );
            expect(validUtc.status).toBe(201);

            const futureUtc = await createReading(
                token,
                readingInput("AFTER_BREAKFAST", 115, "2026-11-13")
            );
            expect(futureUtc.status).toBe(400);
            expect(futureUtc.body.message).toBe("Date cannot be in the future.");
        });

        test("accepts a date before today in the supplied timezone", async () => {
            const response = await createReading(
                token,
                readingInput("MORNING", 100, "2026-11-01"),
                { "X-Time-Zone": "Asia/Kolkata" }
            );

            expect(response.status).toBe(201);
        });

        test("rejects invalid timezone identifiers with 400", async () => {
            const response = await createReading(
                token,
                readingInput("MORNING", 110, "2026-11-10"),
                { "X-Time-Zone": "Invalid/Timezone_Name" }
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid timezone identifier.");
        });

        test("enforces timezone validation during reading update", async () => {
            const created = await createReading(
                token,
                readingInput("MORNING", 110, "2026-11-10"),
                { "X-Time-Zone": "Asia/Kolkata" }
            );

            const id = created.body.data.reading.id;

            // Updating to 2026-11-13 with Asia/Kolkata is valid
            const validUpdate = await request(app)
                .put(`${BASE_URL}/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .set("X-Time-Zone", "Asia/Kolkata")
                .send({ date: "2026-11-13" });

            expect(validUpdate.status).toBe(200);

            // Updating to 2026-11-14 with Asia/Kolkata is future -> rejected
            const futureUpdate = await request(app)
                .put(`${BASE_URL}/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .set("X-Time-Zone", "Asia/Kolkata")
                .send({ date: "2026-11-14" });

            expect(futureUpdate.status).toBe(400);
            expect(futureUpdate.body.message).toBe("Date cannot be in the future.");

            // Invalid timezone during update is rejected
            const invalidTzUpdate = await request(app)
                .put(`${BASE_URL}/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .set("X-Time-Zone", "Not/Real")
                .send({ date: "2026-11-10" });

            expect(invalidTzUpdate.status).toBe(400);
            expect(invalidTzUpdate.body.message).toBe("Invalid timezone identifier.");
        });
    });
});
