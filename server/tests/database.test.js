import prisma from "../src/config/database.js";

describe("Test database connection", () => {
    test("connects to the dedicated test database", async () => {
        const result = await prisma.$queryRaw`
            SELECT current_database() AS database_name
        `;

        expect(result[0].database_name).toBe("sweety_test_db");
    });
});
