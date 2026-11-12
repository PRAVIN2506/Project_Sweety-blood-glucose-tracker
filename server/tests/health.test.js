import request from "supertest";
import app from "../src/app.js";

describe("Health API", () => {
    test("GET /api/health returns HTTP 200", async () => {
        const response = await request(app)
            .get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Sweety API is running!",
        });
    });

    test("unknown routes return HTTP 404", async () => {
        const response = await request(app)
            .get("/api/unknown-test-route");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});
