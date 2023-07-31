import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import { RootState } from "../store";

const initialState: {
  user?: GetPersonDetailsResponse;
  token?: string;
} = {
  user: undefined,
  token: undefined,
};

const AuthenticationReducer = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<GetPersonDetailsResponse>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = AuthenticationReducer.actions;
export default AuthenticationReducer.reducer;

export const selectUser = (state: RootState) => state.AuthenticationReducer.user;
