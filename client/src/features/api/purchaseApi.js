import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "https://lms-backend-jrz9.onrender.com/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/courses/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
    getPendingPurchases: builder.query({
      query: () => ({
        url: `/pending`,
        method: "GET",
      }),
      transformErrorResponse: (response) => {
        return response.data || { message: "Failed to fetch pending purchases" };
      }
    }),
    getInstructorSalesData: builder.query({
      query: () => ({
        url: `/instructor/sales`,
        method: "GET",
      }),
      transformErrorResponse: (response) => {
        return response.data || { message: "Failed to fetch sales data" };
      }
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useGetPendingPurchasesQuery,
  useGetInstructorSalesDataQuery,
} = purchaseApi;
