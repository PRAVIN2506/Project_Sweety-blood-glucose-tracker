import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/database.js";

const DEMO_USER = {
    name: "Sweety Demo",
    email: "demo@sweetytracker.com",
    password: "SweetyDemo@2026",
};

const SALT_ROUNDS = 12;

const getDateDaysAgo = (daysAgo) => {
    const date = new Date();

    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - daysAgo);

    return date;
};

const createDemoUser = async (tx) => {
    const existingUser = await tx.user.findUnique({
        where: {
            email: DEMO_USER.email,
        },
    });

    if (existingUser) {
        console.log(`Demo user already exists: ${DEMO_USER.email}`);
        return existingUser;
    }

    const passwordHash = await bcrypt.hash(
        DEMO_USER.password,
        SALT_ROUNDS
    );

    const user = await tx.user.create({
        data: {
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            passwordHash,
        },
    });

    console.log(`Created demo user: ${DEMO_USER.email}`);

    return user;
};

const createDemoReadings = async (tx, userId) => {
    const yesterday = getDateDaysAgo(1);
    const twoDaysAgo = getDateDaysAgo(2);

    const readings = [
        {
            date: twoDaysAgo,
            slot: "MORNING",
            value: 105,
        },
        {
            date: twoDaysAgo,
            slot: "AFTER_BREAKFAST",
            value: 142,
        },
        {
            date: twoDaysAgo,
            slot: "AFTER_LUNCH",
            value: 156,
        },
        {
            date: twoDaysAgo,
            slot: "AFTER_DINNER",
            value: 138,
        },
        {
            date: yesterday,
            slot: "MORNING",
            value: 98,
        },
        {
            date: yesterday,
            slot: "AFTER_BREAKFAST",
            value: 135,
        },
        {
            date: yesterday,
            slot: "AFTER_LUNCH",
            value: 149,
        },
        {
            date: yesterday,
            slot: "AFTER_DINNER",
            value: 128,
        },
    ];

    const result = await tx.reading.createMany({
        data: readings.map((reading) => ({
            ...reading,
            userId,
        })),
        skipDuplicates: true,
    });

    console.log(`Created ${result.count} new demo readings.`);
};

const main = async () => {
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "Demo seeding is disabled in production."
        );
    }

    await prisma.$transaction(async (tx) => {
        const user = await createDemoUser(tx);

        await createDemoReadings(tx, user.id);
    });

    console.log("Demo database seeding completed.");
};

main()
    .catch((error) => {
        console.error("Demo database seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });