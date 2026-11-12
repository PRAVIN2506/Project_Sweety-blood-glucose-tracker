import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { registerUser } from "../src/services/auth.service.js";

const TEST_PASSWORD = "StrongPass123";

const createTestUser = async () => {
    const email = `test-${randomUUID()}@example.com`;

    const result = await registerUser({
        name: "Test User",
        email,
        password: TEST_PASSWORD,
    });

    return {
        email,
        password: TEST_PASSWORD,
        token: result.token,
        user: result.user,
    };
};

const clearTestData = async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
};

describe("Authentication API", () => {
    beforeEach(async () => {
        await clearTestData();
    });

    afterEach(async () => {
        await clearTestData();
    });

    test("registers a new user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: `register-${randomUUID()}@example.com`,
                password: TEST_PASSWORD,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty("id");
        expect(response.body.data.user).toHaveProperty("email");
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data.user).not.toHaveProperty("passwordHash");
    });

    test("rejects registration with an existing email", async () => {
        const user = await createTestUser();

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Another User",
                email: user.email,
                password: TEST_PASSWORD,
            });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Email is already registered.");
    });

    test("rejects invalid registration data", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "A",
                email: "not-an-email",
                password: "123",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed.");
    });

    test("logs in with valid credentials", async () => {
        const user = await createTestUser();

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(user.email);
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data.user).not.toHaveProperty("passwordHash");
    });

    test("rejects invalid login credentials", async () => {
        const user = await createTestUser();

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: "IncorrectPassword123",
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email or password.");
    });

    test("rejects access to the current-user endpoint without a token", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("returns the current user with a valid token", async () => {
        const user = await createTestUser();

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${user.token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBe(user.user.id);
        expect(response.body.data.user.email).toBe(user.email);
        expect(response.body.data.user).not.toHaveProperty("passwordHash");
    });
});
