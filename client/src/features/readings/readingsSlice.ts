import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";

import * as readingsService from "./readingsService";

import type {
    Reading,
    CreateReadingInput,
    UpdateReadingInput,
    ReadingsState,
} from "./readingsTypes";

const initialState: ReadingsState = {
    readings: [],
    status: "idle",
    mutationStatus: "idle",
    error: null,
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

export const fetchReadings = createAsyncThunk<
    Reading[],
    void,
    { rejectValue: string }
>(
    "readings/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await readingsService.getReadings();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const addReading = createAsyncThunk<
    Reading,
    CreateReadingInput,
    { rejectValue: string }
>(
    "readings/add",
    async (data, { rejectWithValue }) => {
        try {
            return await readingsService.createReading(data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const editReading = createAsyncThunk<
    Reading,
    UpdateReadingInput,
    { rejectValue: string }
>(
    "readings/edit",
    async (input, { rejectWithValue }) => {
        try {
            return await readingsService.updateReading(input);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const removeReading = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    "readings/remove",
    async (id, { rejectWithValue }) => {
        try {
            return await readingsService.deleteReading(id);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const readingsSlice = createSlice({
    name: "readings",
    initialState,

    reducers: {
        clearReadingsError: (state) => {
            state.error = null;
        },

        clearReadings: (state) => {
            state.readings = [];
            state.status = "idle";
            state.mutationStatus = "idle";
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // Fetch readings
            .addCase(fetchReadings.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchReadings.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.readings = action.payload;
            })
            .addCase(fetchReadings.rejected, (state, action) => {
                state.status = "failed";
                state.error =
                    action.payload || "Failed to load readings.";
            })

            // Add reading
            .addCase(addReading.pending, (state) => {
                state.mutationStatus = "loading";
                state.error = null;
            })
            .addCase(addReading.fulfilled, (state, action) => {
                state.mutationStatus = "succeeded";
                state.readings.unshift(action.payload);
            })
            .addCase(addReading.rejected, (state, action) => {
                state.mutationStatus = "failed";
                state.error =
                    action.payload || "Failed to add reading.";
            })

            // Edit reading
            .addCase(editReading.pending, (state) => {
                state.mutationStatus = "loading";
                state.error = null;
            })
            .addCase(editReading.fulfilled, (state, action) => {
                state.mutationStatus = "succeeded";

                const index = state.readings.findIndex(
                    (reading) =>
                        reading.id === action.payload.id
                );

                if (index !== -1) {
                    state.readings[index] = action.payload;
                }
            })
            .addCase(editReading.rejected, (state, action) => {
                state.mutationStatus = "failed";
                state.error =
                    action.payload || "Failed to update reading.";
            })

            // Delete reading
            .addCase(removeReading.pending, (state) => {
                state.mutationStatus = "loading";
                state.error = null;
            })
            .addCase(removeReading.fulfilled, (state, action) => {
                state.mutationStatus = "succeeded";

                state.readings = state.readings.filter(
                    (reading) =>
                        reading.id !== action.payload
                );
            })
            .addCase(removeReading.rejected, (state, action) => {
                state.mutationStatus = "failed";
                state.error =
                    action.payload || "Failed to delete reading.";
            });
    },
});

export const {
    clearReadingsError,
    clearReadings,
} = readingsSlice.actions;

export default readingsSlice.reducer;