import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";

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

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message:
            err.statusCode && err.statusCode < 500
                ? err.message
                : "Internal server error.",
    });
});

export default app;
