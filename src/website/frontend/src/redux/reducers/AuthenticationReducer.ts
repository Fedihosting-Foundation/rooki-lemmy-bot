import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import { RootState } from "../store";

const initialState: {
  instance: string;
  user?: GetPersonDetailsResponse;
} = {
  instance: "https://lemmy.world",
  user: undefined,
};

const AuthenticationReducer = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<GetPersonDetailsResponse>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      localStorage.removeItem("jwt");
      localStorage.removeItem("personid");
      state.user = undefined;
    },
  },
});

export const { setUser, logoutUser } = AuthenticationReducer.actions;
export default AuthenticationReducer.reducer;

export const selectUser = (state: RootState) => state.AuthenticationReducer.user;
export const selectInstance = (state: RootState) => state.AuthenticationReducer.instance;
