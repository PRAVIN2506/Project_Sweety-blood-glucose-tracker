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
import ReadingsPage from "../pages/ReadingsPage";
import ReportsPage from "../pages/ReportsPage";

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const isInitializing = useAppSelector(
        (state) => state.auth.isInitializing
    );

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-canvas">
                <p className="text-sm font-medium text-text-secondary">
                    Verifying session...
                </p>
            </div>
        );
    }

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}

function AppRoutes() {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const isInitializing = useAppSelector(
        (state) => state.auth.isInitializing
    );

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-canvas">
                <p className="text-sm font-medium text-text-secondary">
                    Verifying session...
                </p>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/dashboard" replace />
                        : <LoginPage />
                }
            />

            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? <Navigate to="/dashboard" replace />
                        : <RegisterPage />
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/readings"
                element={
                    <ProtectedRoute>
                        <ReadingsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <ReportsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/"
                element={
                    <Navigate
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;