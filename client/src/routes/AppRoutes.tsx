import type { ReactNode } from "react";

import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { useAppSelector } from "../hooks/useAppSelector";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";

// Protected route
function ProtectedRoute({
    children,
}: {
    children: ReactNode;
}) {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const isInitializing = useAppSelector(
        (state) => state.auth.isInitializing
    );

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Checking your session...
            </div>
        );
    }

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}

// Application routes
function AppRoutes() {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const isInitializing = useAppSelector(
        (state) => state.auth.isInitializing
    );

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Checking your session...
            </div>
        );
    }

    return (
        <Routes>
            {/* Login */}
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/dashboard" replace />
                        : <LoginPage />
                }
            />

            {/* Registration */}
            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? <Navigate to="/dashboard" replace />
                        : <RegisterPage />
                }
            />

            {/* Protected dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* Default route */}
            <Route
                path="/"
                element={
                    <Navigate
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        replace
                    />
                }
            />

            {/* Unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;