import dotenv from "dotenv";

const result = dotenv.config({
    path: ".env.test",
    override: true,
    quiet: true,
});

if (result.error) {
    throw new Error(
        "Unable to load .env.test. Create the test environment file first."
    );
}

if (!process.env.DATABASE_URL?.includes("sweety_test_db")) {
    throw new Error(
        "Tests must use the dedicated sweety_test_db database."
    );
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env.test.");
}
