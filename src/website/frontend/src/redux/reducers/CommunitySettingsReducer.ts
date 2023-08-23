import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import communityConfigModel from "../../models/communityConfigModel";

const initialState: {
  currentConfig?: communityConfigModel;
} = {
  currentConfig: undefined,
};

const CommunitySettingsReducer = createSlice({
  name: "communitySettings",
  initialState,
  reducers: {
    setCurrentCommunity: (state, action: PayloadAction<communityConfigModel | undefined>) => {
      state.currentConfig = action.payload;
    },
  },
});

export const { setCurrentCommunity } = CommunitySettingsReducer.actions;
export default CommunitySettingsReducer.reducer;

export const selectCurrentConfig = (state: RootState) => state.CommunitySettingsReducer.currentConfig;
