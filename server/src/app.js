import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Parse JSON requests
app.use(express.json());

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sweety API is running!",
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Handle malformed JSON request bodies
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body.",
        });
    }

    // Handle Prisma known request errors
    if (err.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "A record with this value already exists.",
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Requested record was not found.",
        });
    }

    if (err.code === "P2003") {
        return res.status(400).json({
            success: false,
            message: "Invalid related record.",
        });
    }

    // Support both custom application errors and Express parser errors
    const statusCode = err.statusCode || err.status || 500;

    if (statusCode >= 400 && statusCode < 500) {
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Request could not be processed.",
        });
    }

    // Log unexpected server errors, but do not expose internal details
    console.error("Unhandled API error:", err);

    return res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

export default app;
