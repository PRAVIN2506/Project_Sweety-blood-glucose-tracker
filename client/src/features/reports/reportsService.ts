import api from "../../services/api";

import type {
    Report,
    ReportType,
} from "./reportsTypes";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const getReport = async (
    type: ReportType,
    date: string,
    signal?: AbortSignal
): Promise<Report> => {
    const response = await api.get<ApiResponse<Report>>(
        `/reports/${type}`,
        {
            params: { date },
            signal,
        }
    );

    return response.data.data;
};