import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IUserInfoResponse from "../../models/IUserInfoResponse";
import { GetPersonDetailsResponse } from "lemmy-js-client";
const utilApi = createApi({
  reducerPath: "utilApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "api/utils",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      const user = localStorage.getItem("personid");
      if (user) {
        headers.set("user", user);
      }
      return headers;
    },
  }),
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getPerson: builder.query<
      GetPersonDetailsResponse,
      { userId: number }
    >({
      query: (user) => ({
        url: `/person`,
        method: "POST",
        body: {
          userId: user.userId,
        },
      }),
    }),
  }),
});

export const { useGetPersonQuery } = utilApi;
export default utilApi;
