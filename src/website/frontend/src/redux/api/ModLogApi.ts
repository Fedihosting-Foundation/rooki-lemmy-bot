import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IUserInfoResponse from "../../models/IUserInfoResponse";
const modLogApi = createApi({
  reducerPath: "modlog",
  baseQuery: fetchBaseQuery({
    baseUrl: "api/user",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      const user = localStorage.getItem("personid");
      if (user) {
        headers.set("user", user);
      }
      const instance = localStorage.getItem("instance") || "https://lemmy.world";

      headers.set("instance", instance);
      return headers;
    },
  }),
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getModLogs: builder.query<
      IUserInfoResponse,
      { userId: number; communityId?: number }
    >({
      query: (user) => ({
        url: `/info`,
        method: "POST",
        body: {
          userId: user.userId,
          communityId: user.communityId,
        },
      }),
    }),
  }),
});

export const { useLazyGetModLogsQuery } = modLogApi;
export default modLogApi;
