import api from "../../services/api";

import type {
    AuthPayload,
    LoginCredentials,
    RegisterCredentials,
    User,
} from "./authTypes";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const register = async (
    credentials: RegisterCredentials
): Promise<AuthPayload> => {
    const response = await api.post<ApiResponse<AuthPayload>>(
        "/auth/register",
        credentials
    );

    return response.data.data;
};

export const login = async (
    credentials: LoginCredentials
): Promise<AuthPayload> => {
    const response = await api.post<ApiResponse<AuthPayload>>(
        "/auth/login",
        credentials
    );

    return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>(
        "/auth/me"
    );

    return response.data.data.user;
};