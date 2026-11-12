
import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";

import { getReport } from "./reportsService";

import type {
    Report,
    ReportType,
    ReportsState,
} from "./reportsTypes";

interface FetchReportInput {
    type: ReportType;
    date: string;
}

const getToday = (): string => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60_000)
        .toISOString()
        .slice(0, 10);
};

const initialState: ReportsState = {
    daily: null,
    monthToDate: null,
    monthly: null,

    status: {
        daily: "idle",
        "month-to-date": "idle",
        monthly: "idle",
    },

    errors: {
        daily: null,
        "month-to-date": null,
        monthly: null,
    },

    requestIds: {
        daily: null,
        "month-to-date": null,
        monthly: null,
    },

    selectedDate: getToday(),
};

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

export const fetchReport = createAsyncThunk<
    Report,
    FetchReportInput,
    { rejectValue: string }
>(
    "reports/fetchReport",
    async ({ type, date }, { rejectWithValue, signal }) => {
        try {
            return await getReport(type, date, signal);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const reportsSlice = createSlice({
    name: "reports",
    initialState,

    reducers: {
        setSelectedDate: (state, action: { payload: string }) => {
            state.selectedDate = action.payload;
        },

        clearReportsError: (state) => {
            state.errors = {
                daily: null,
                "month-to-date": null,
                monthly: null,
            };
        },

        clearReports: (state) => {
            state.daily = null;
            state.monthToDate = null;
            state.monthly = null;

            state.status = {
                daily: "idle",
                "month-to-date": "idle",
                monthly: "idle",
            };

            state.errors = {
                daily: null,
                "month-to-date": null,
                monthly: null,
            };

            state.requestIds = {
                daily: null,
                "month-to-date": null,
                monthly: null,
            };
        },
    },

    extraReducers: (builder) => {
        builder
            // Daily, month-to-date and monthly report requests
            .addCase(fetchReport.pending, (state, action) => {
                const { type } = action.meta.arg;

                state.status[type] = "loading";
                state.errors[type] = null;
                state.requestIds[type] = action.meta.requestId;
            })

            .addCase(fetchReport.fulfilled, (state, action) => {
                const { type } = action.meta.arg;

                // Ignore outdated responses.
                if (
                    state.requestIds[type] !== action.meta.requestId
                ) {
                    return;
                }

                state.status[type] = "succeeded";
                state.requestIds[type] = null;

                if (type === "daily") {
                    state.daily = action.payload;
                } else if (type === "month-to-date") {
                    state.monthToDate = action.payload;
                } else {
                    state.monthly = action.payload;
                }
            })

            .addCase(fetchReport.rejected, (state, action) => {
                const { type } = action.meta.arg;

                // Ignore outdated responses.
                if (
                    state.requestIds[type] !== action.meta.requestId
                ) {
                    return;
                }

                state.requestIds[type] = null;

                // Cancellation is not an API failure.
                if (action.meta.aborted) {
                    state.status[type] = "idle";
                    return;
                }

                state.status[type] = "failed";
                state.errors[type] =
                    action.payload || "Failed to load report.";
            });
    },
});

export const {
    setSelectedDate,
    clearReportsError,
    clearReports,
} = reportsSlice.actions;

export default reportsSlice.reducer;
