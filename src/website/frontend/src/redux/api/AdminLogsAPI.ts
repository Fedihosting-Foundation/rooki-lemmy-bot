import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Community } from "lemmy-js-client";
import AdminLogModel, { adminAllowedEntries } from "../../models/adminLogModel";

function providesList<R extends { id: string | number }[], T extends string>(
  resultsWithIds: R | undefined,
  tagType: T
) {
  return resultsWithIds
    ? [
        ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
        { type: tagType, id: "LIST" },
      ]
    : [{ type: tagType, id: "LIST" }];
}

const adminLogsAPI = createApi({
  reducerPath: "adminlogs",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/adminLogs",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["adminlogs"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    getAdminLogEntry: builder.query<AdminLogModel<adminAllowedEntries>, string>({
      query: (entryId) => `/getone/${entryId}`,
      providesTags: (result, error, arg) => [{ type: "adminlogs", id: arg }],
    }),
    getAdminLog: builder.query<
      AdminLogModel<adminAllowedEntries>[],
      { id: string | undefined; communities: number[]; ammount?: number }
    >({
      query: (options) => ({
        url: `/`,
        method: "POST",
        body: options,
      }),
      providesTags: (result) => providesList(result, "adminlogs"),
    }),
    refresAdminLog: builder.mutation<AdminLogModel<adminAllowedEntries>, string>(
      {
        query: (id) => `/refresh/${id}`,
        invalidatesTags: (result, error, arg) => [
          { type: "adminlogs", id: arg },
        ],
      }
    ),
    fetchCommunities: builder.query<
      { success: boolean; communities: Community[] },
      void
    >({
      query: () => `/communities`,
    }),
  }),
});

export const {
  useLazyFetchCommunitiesQuery,
  useGetAdminLogEntryQuery,
  useLazyGetAdminLogQuery,
  useRefresAdminLogMutation,
} = adminLogsAPI;
export default adminLogsAPI;
