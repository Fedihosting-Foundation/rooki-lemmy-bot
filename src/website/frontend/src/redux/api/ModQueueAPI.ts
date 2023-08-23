import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IModQueueEntry, {
  QueueEntryResult,
  allowedEntries,
} from "../../models/IModeQueueEntry";
import { Community } from "lemmy-js-client";

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

const modQueueApi = createApi({
  reducerPath: "modqueue",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/modqueue",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["modqueue"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    getModqueueEntry: builder.query<IModQueueEntry<allowedEntries>, string>({
      query: (entryId) => `/getone/${entryId}`,
      providesTags: (result, error, arg) => [{ type: "modqueue", id: arg }],
    }),
    getModqueue: builder.query<
      IModQueueEntry<allowedEntries>[],
      { id: string | undefined; communities: number[]; ammount?: number }
    >({
      query: (options) => ({
        url: `/`,
        method: "POST",
        body: options,
      }),
      providesTags: (result) => providesList(result, "modqueue"),
    }),
    updateModqueue: builder.mutation<
      IModQueueEntry<allowedEntries>,
      {
        result?: QueueEntryResult;
        id: string;
        reason: string;
      }
    >({
      query: (body) => ({
        url: `/resolve`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "modqueue", id: arg.id },
      ],
    }),
    addModMessage: builder.mutation<
      IModQueueEntry<allowedEntries>,
      {
        id: string;
        modNote: string;
      }
    >({
      query: (body) => ({
        url: `/addnote`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "modqueue", id: arg.id },
      ],
    }),
    refreshModMessage: builder.mutation<IModQueueEntry<allowedEntries>, string>(
      {
        query: (id) => `/refresh/${id}`,
        invalidatesTags: (result, error, arg) => [
          { type: "modqueue", id: arg },
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
  useGetModqueueEntryQuery,
  useRefreshModMessageMutation,
  useLazyGetModqueueQuery,
  useUpdateModqueueMutation,
  useAddModMessageMutation,
  useLazyFetchCommunitiesQuery,
} = modQueueApi;
export default modQueueApi;
