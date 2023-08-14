import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState: {
  spotlight?: boolean;
} = {
  spotlight: (localStorage.getItem("spotlight") || "true") === "true",
};

const SettingsReducer = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSpotlight: (state, action: PayloadAction<boolean>) => {
      localStorage.setItem("spotlight", action.payload ? "true" : "false");
      state.spotlight = action.payload;
    },
  },
});

export const { setSpotlight } = SettingsReducer.actions;
export default SettingsReducer.reducer;

export const selectSpotlight = (state: RootState) => state.SettingsReducer.spotlight;
