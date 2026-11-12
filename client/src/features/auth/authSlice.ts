import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import * as authService from "./authService";

import type {
    AuthPayload,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    User,
} from "./authTypes";

// Initial authentication state
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
    user: null,
    token: storedToken,
    isAuthenticated: false,
    isInitializing: Boolean(storedToken),
    status: "idle",
    error: null,
};

// Extract API error messages
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return (
            error.response?.data?.message ||
            error.message ||
            "Something went wrong."
        );
    }

    return error instanceof Error
        ? error.message
        : "Something went wrong.";
};

// Registration
export const registerUser = createAsyncThunk<
    AuthPayload,
    RegisterCredentials,
    { rejectValue: string }
>(
    "auth/register",
    async (credentials, { rejectWithValue }) => {
        try {
            const result = await authService.register(credentials);

            localStorage.setItem("token", result.token);

            return result;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Login
export const loginUser = createAsyncThunk<
    AuthPayload,
    LoginCredentials,
    { rejectValue: string }
>(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const result = await authService.login(credentials);

            localStorage.setItem("token", result.token);

            return result;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Restore current authenticated user
interface AuthError {
    message: string;
    status?: number;
}

export const fetchCurrentUser = createAsyncThunk<
    User,
    void,
    { rejectValue: AuthError }
>(
    "auth/me",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.getCurrentUser();
        } catch (error) {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;

            if (status === 401) {
                localStorage.removeItem("token");
            }

            return rejectWithValue({
                message: getErrorMessage(error),
                status,
            });
        }
    }
);

// Logout
export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        localStorage.removeItem("token");
    }
);

// Authentication slice
const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // Registration
            .addCase(registerUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.isInitializing = false;
            })

            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Registration failed.";
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.isInitializing = false;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Login failed.";
            })

            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isInitializing = true;
                state.error = null;
            })

            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isInitializing = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.status = "succeeded";
            })

            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isInitializing = false;
                state.isAuthenticated = false;
                state.user = null;
                state.status = "failed";

                state.error =
                    action.payload?.message ||
                    "Unable to verify your session.";

                if (action.payload?.status === 401) {
                    state.token = null;
                }
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isInitializing = false;
                state.status = "idle";
                state.error = null;
            });
    },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;