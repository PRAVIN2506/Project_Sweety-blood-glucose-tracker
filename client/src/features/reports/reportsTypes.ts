import type { ReadingSlot } from "../readings/readingsTypes";

export interface ReportReading {
    id: string;
    date: string;
    slot: ReadingSlot;
    value: number;
}

export interface Report {
    startDate: string;
    endDate: string;
    highest: number | null;
    lowest: number | null;
    average: number | null;
    count: number;
    readings: ReportReading[];
}

export type ReportType =
    | "daily"
    | "month-to-date"
    | "monthly";

export type RequestStatus =
    | "idle"
    | "loading"
    | "succeeded"
    | "failed";

export interface ReportsState {
    daily: Report | null;
    monthToDate: Report | null;
    monthly: Report | null;

    status: Record<ReportType, RequestStatus>;
    errors: Record<ReportType, string | null>;
    requestIds: Record<ReportType, string | null>;

    selectedDate: string;
}