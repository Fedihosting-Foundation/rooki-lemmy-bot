import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ICommunityConfigResponse } from "../../models/ICommunityConfigResponse";
import communityConfigModel from "../../models/communityConfigModel";
import { Community } from "lemmy-js-client";
const modConfigApi = createApi({
  reducerPath: "modConfigApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "api/config",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  refetchOnReconnect: true,
  tagTypes: ["communityConfig"],
  endpoints: (builder) => ({
    getAllModConfig: builder.query<ICommunityConfigResponse, void>({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["communityConfig"],
    }),
    getModConfig: builder.query<ICommunityConfigResponse, number>({
      query: (id) => ({
        url: `/${String(id)}`,
        method: "GET",
      }),
    }),
    updateModConfig: builder.mutation<
      communityConfigModel,
      Partial<communityConfigModel> & { community: Community }
    >({
      query: (body) => ({
        url: `/${body.community.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["communityConfig"],
    }),
    addCommunity: builder.mutation<
      communityConfigModel,
      { communityId: number }
    >({
      query: (body) => ({
        url: `/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["communityConfig"],
    }),
  }),
});

export const {
  useGetAllModConfigQuery,
  useGetModConfigQuery,
  useUpdateModConfigMutation,
  useAddCommunityMutation,
} = modConfigApi;
export default modConfigApi;
