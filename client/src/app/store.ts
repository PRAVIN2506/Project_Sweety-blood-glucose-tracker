import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import readingsReducer from "../features/readings/readingsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        readings: readingsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;