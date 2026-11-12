import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import readingsReducer from "../features/readings/readingsSlice";
import reportsReducer from "../features/reports/reportsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        readings: readingsReducer,
        reports: reportsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;