import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import IModQueueEntry from "../../models/IModeQueueEntry";
const ModQueueApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getModqueue: builder.query<IModQueueEntry, void>({
      query: () => `/modqueue`,
    }),
    updateModqueue: builder.mutation<IModQueueEntry, IModQueueEntry>({
      query: (body) => ({
        url: `/modqueue`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const { useGetModqueueQuery, useUpdateModqueueMutation } = ModQueueApi;
export default ModQueueApi;