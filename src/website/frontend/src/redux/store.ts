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
import modQueueApi from "./api/ModQueueAPI";
import modLogApi from "./api/ModLogApi";

import AuthenticationReducer from "./reducers/AuthenticationReducer";
import SettingsReducer from "./reducers/SettingsReducer";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import utilApi from "./api/UtilApi";
import modConfigApi from "./api/ModConfigApi";
import CommunitySettingsReducer from "./reducers/CommunitySettingsReducer";
import adminLogsAPI from "./api/AdminLogsAPI";
import siteConfigAPI from "./api/SiteConfigAPI";

export const store = configureStore({
  reducer: {
    AuthenticationReducer,
    SettingsReducer,
    CommunitySettingsReducer,
    [modQueueApi.reducerPath]: modQueueApi.reducer,
    [modLogApi.reducerPath]: modLogApi.reducer,
    [utilApi.reducerPath]: utilApi.reducer,
    [modConfigApi.reducerPath]: modConfigApi.reducer,
    [adminLogsAPI.reducerPath]: adminLogsAPI.reducer,
    [siteConfigAPI.reducerPath]: siteConfigAPI.reducer,
  },
  middleware: (getDefaultMiddleware) => 
   getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(thunk)
      .concat(modLogApi.middleware)
      .concat(modQueueApi.middleware)
      .concat(utilApi.middleware)
      .concat(modConfigApi.middleware)
      .concat(adminLogsAPI.middleware)
      .concat(siteConfigAPI.middleware),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
