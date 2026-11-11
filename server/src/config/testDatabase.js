
import dotenv from "dotenv";
dotenv.config();

import prisma from "./database.js";

async function testDatabaseConnection() {
    try {
        await prisma.$connect();

        console.log("Database connected successfully!");

        const users = await prisma.user.count();
        const readings = await prisma.reading.count();

        console.log("Total users:", users);
        console.log("Total readings:", readings);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
