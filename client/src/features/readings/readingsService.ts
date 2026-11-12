import api from "../../services/api";

import type {
    Reading,
    CreateReadingInput,
    UpdateReadingInput,
} from "./readingsTypes";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const getReadings = async (): Promise<Reading[]> => {
    const response = await api.get<
        ApiResponse<{ readings: Reading[] }>
    >("/readings");

    return response.data.data.readings;
};

export const getReadingById = async (
    id: string
): Promise<Reading> => {
    const response = await api.get<
        ApiResponse<{ reading: Reading }>
    >(`/readings/${id}`);

    return response.data.data.reading;
};

export const createReading = async (
    data: CreateReadingInput
): Promise<Reading> => {
    const response = await api.post<
        ApiResponse<{ reading: Reading }>
    >("/readings", data);

    return response.data.data.reading;
};

export const updateReading = async ({
    id,
    data,
}: UpdateReadingInput): Promise<Reading> => {
    const response = await api.put<
        ApiResponse<{ reading: Reading }>
    >(`/readings/${id}`, data);

    return response.data.data.reading;
};

export const deleteReading = async (
    id: string
): Promise<string> => {
    await api.delete(`/readings/${id}`);

    return id;
};