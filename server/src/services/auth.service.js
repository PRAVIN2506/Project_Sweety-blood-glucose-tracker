import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { generateToken } from "../utils/generateToken.js";

const SALT_ROUNDS = 12;

export const registerUser = async ({ name, email, password }) => {
    if (Buffer.byteLength(password, "utf8") > 72) {
        const error = new Error("Password must not exceed 72 bytes.");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const error = new Error("Email is already registered.");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    const token = generateToken(user.id);

    return { user, token };
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };

    const token = generateToken(user.id);

    return {
        user: safeUser,
        token,
    };
};

export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return user;
};
