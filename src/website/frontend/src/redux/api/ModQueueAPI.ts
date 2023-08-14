import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IModQueueEntry, {
  QueueEntryResult,
  allowedEntries,
} from "../../models/IModeQueueEntry";
const modQueueApi = createApi({
  reducerPath: "modqueue",
  baseQuery: fetchBaseQuery({
    baseUrl: "api",
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
  tagTypes: ["modqueue"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getModqueue: builder.query<IModQueueEntry<allowedEntries>[], void>({
      query: () => `/modqueue`,
      providesTags: ["modqueue"],
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
      invalidatesTags: ["modqueue"],
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
      invalidatesTags: ["modqueue"],
    }),
    refreshModMessage: builder.mutation<IModQueueEntry<allowedEntries>, string>(
      {
        query: (postId) => `/modqueue/refresh/${postId}`,
        invalidatesTags: ["modqueue"],
      }
    ),
  }),
});

export const {
  useRefreshModMessageMutation,
  useGetModqueueQuery,
  useUpdateModqueueMutation,
  useAddModMessageMutation,
} = modQueueApi;
export default modQueueApi;
