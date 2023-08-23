import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState: {
  spotlight?: boolean;
  markedUsers?: number[];
} = {
  spotlight: (localStorage.getItem("spotlight") || "true") === "true",
  markedUsers: localStorage.getItem("markedUsers") ? JSON.parse(localStorage.getItem("markedUsers")!) : [],
};

const SettingsReducer = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSpotlight: (state, action: PayloadAction<boolean>) => {
      localStorage.setItem("spotlight", action.payload ? "true" : "false");
      state.spotlight = action.payload;
    },
    addMarkedUser: (state, action: PayloadAction<number>) => {
      state.markedUsers?.push(action.payload);
    },
    removeMarkedUser: (state, action: PayloadAction<number>) => {
      state.markedUsers = state.markedUsers?.filter((id) => id !== action.payload);      
    }

  },
});

export const { setSpotlight, addMarkedUser, removeMarkedUser } = SettingsReducer.actions;
export default SettingsReducer.reducer;

export const selectSpotlight = (state: RootState) => state.SettingsReducer.spotlight;
export const selectMarkedUsers = (state: RootState) => state.SettingsReducer.markedUsers;
