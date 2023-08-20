import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IModQueueEntry, {
  QueueEntryResult,
  allowedEntries,
} from "../../models/IModeQueueEntry";

function providesList<R extends { id: string | number }[], T extends string>(
  resultsWithIds: R | undefined,
  tagType: T
) {
  return resultsWithIds
    ? [
        { type: tagType, id: "LIST" },
        ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
      ]
    : [{ type: tagType, id: "LIST" }];
}

const modQueueApi = createApi({
  reducerPath: "modqueue",
  baseQuery: fetchBaseQuery({
    baseUrl: "api",
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
      query: (postId) => `/modqueue/getone/${postId}`,
      providesTags: (result, error, arg) => [{ type: "modqueue", id: arg }],
    }),
    getModqueue: builder.query<
      IModQueueEntry<allowedEntries>[],
      { id: string | undefined; communities: number[] }
    >({
      query: (options) => ({
        url: `/modqueue`,
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
        url: `/modqueue/resolve`,
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
        url: `/modqueue/addnote`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "modqueue", id: arg.id },
      ],
    }),
    refreshModMessage: builder.mutation<IModQueueEntry<allowedEntries>, string>(
      {
        query: (postId) => `/modqueue/refresh/${postId}`,
        invalidatesTags: (result, error, arg) => [
          { type: "modqueue", id: arg },
        ],
      }
    ),
  }),
});

export const {
  useRefreshModMessageMutation,
  useLazyGetModqueueQuery,
  useUpdateModqueueMutation,
  useAddModMessageMutation,
} = modQueueApi;
export default modQueueApi;
