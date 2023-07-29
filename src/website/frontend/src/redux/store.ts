import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistStore,
} from "redux-persist";
import thunk from "redux-thunk";
import ModQueueApi from "./api/ModQueueAPI";

import AuthenticationReducer from "./reducers/AuthenticationReducer";

export const store = configureStore({
  reducer: {
    AuthenticationReducer,
    [ModQueueApi.reducerPath]: ModQueueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(thunk)
      .concat(ModQueueApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
