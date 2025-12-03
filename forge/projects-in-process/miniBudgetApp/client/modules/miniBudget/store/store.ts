import { configureStore } from '@reduxjs/toolkit';
import budgetReducer from './slice';

export const store = configureStore({
    reducer: {
        budget: budgetReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
