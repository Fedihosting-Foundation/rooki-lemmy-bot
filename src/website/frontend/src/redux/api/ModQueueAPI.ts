import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IModQueueEntry, { QueueEntryResult } from "../../models/IModeQueueEntry";
const ModQueueApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      const user = localStorage.getItem("personid");
      console.log(user);
      if (user) {
        headers.set("user", user);
      }
      console.log(headers);
      return headers;
    },
  }),
  tagTypes: ["modqueue"],

  endpoints: (builder) => ({
    getModqueue: builder.query<IModQueueEntry[], void>({
      query: () => `/modqueue`,
      providesTags: ["modqueue"],
    }),
    updateModqueue: builder.mutation<
      IModQueueEntry,
      {
        result?: QueueEntryResult;
        postId: number;
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
      IModQueueEntry,
      {
        postId: number;
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
  }),
});

export const {
  useGetModqueueQuery,
  useUpdateModqueueMutation,
  useAddModMessageMutation,
} = ModQueueApi;
export default ModQueueApi;
