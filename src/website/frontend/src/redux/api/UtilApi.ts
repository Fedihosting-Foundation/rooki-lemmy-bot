import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

      return headers;
    },
  }),
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    isBotModeratorOfCommunity: builder.query<
      { isMod: boolean },
      { communityId: number }
    >({
      query: (community) => ({
        url: `/is_bot_moderator_of_community`,
        method: "POST",
        body: {
          communityId: community.communityId,
        },
      }),
    }),
  }),
});

export const { useLazyIsBotModeratorOfCommunityQuery } = utilApi;
export default utilApi;
