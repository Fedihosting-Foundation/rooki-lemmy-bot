import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import SiteConfigModel from "../../models/siteConfigModel";
import ResponseModel from "../../models/responseModel";


const siteConfigAPI = createApi({
  reducerPath: "siteconfig",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    prepareHeaders(headers, api) {
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["siteconfig"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    getSiteConfig: builder.query<ResponseModel<SiteConfigModel>, undefined>({
        query: (entryId) => `/`,
        providesTags: ["siteconfig"]
      }),
    updateSiteConfig: builder.mutation<
      ResponseModel<SiteConfigModel>,
      Omit<SiteConfigModel, "id">
    >({
      query: (options) => ({
        url: `/`,
        method: "POST",
        body: options,
      }),
      invalidatesTags: ["siteconfig"]
    }),
  }),
});

export const {
  useGetSiteConfigQuery,
  useUpdateSiteConfigMutation,
} = siteConfigAPI;
export default siteConfigAPI;
