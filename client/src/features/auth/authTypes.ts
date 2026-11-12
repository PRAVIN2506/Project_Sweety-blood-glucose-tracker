export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthPayload {
    user: User;
    token: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}