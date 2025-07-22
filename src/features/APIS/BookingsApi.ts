import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

/** Booking model — NO userId */
export interface Booking {
  bookingId: number;
  eventId: number;
  quantity: number;
  totalAmount: string;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  ticketTypeId: number;
  nationalId: number;          // ← primary customer identifier
  createdAt: string;
  updatedAt: string;
}

/** Type used when creating a booking (all fields except auto‑generated ones) */
type NewBooking = Omit<
  Booking,
  "bookingId" | "bookingStatus" | "createdAt" | "updatedAt"
>;

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  tagTypes: ["Bookings", "Booking"],

  endpoints: (builder) => ({
    /* 📥 Get all bookings */
    getAllBookings: builder.query<Booking[], void>({
      query: () => "bookings",
      providesTags: ["Bookings"],
    }),

    /* 🔍 Get a single booking */
    getBookingById: builder.query<Booking, number>({
      query: (bookingId) => `bookings/${bookingId}`,
      providesTags: (_r, _e, id) => [{ type: "Booking", id }],
    }),

    /* 👤 Get bookings by national‑ID */
    getBookingsByUserNationalId: builder.query<Booking[], number>({
      query: (nationalId) => `bookings/user/national-id/${nationalId}`,
      providesTags: ["Bookings"],
    }),

    /* 🎟️ Get bookings by event */
    getBookingsByEventId: builder.query<Booking[], number>({
      query: (eventId) => `bookings/event/${eventId}`,
      providesTags: ["Bookings"],
    }),

    /* ➕ Create booking — now accepts NewBooking (no userId) */
    createBooking: builder.mutation<Booking, NewBooking>({
      query: (payload) => ({
        url: "bookings",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Bookings"],
    }),

    /* 🔄 Update booking */
    updateBooking: builder.mutation<
      Booking,
      { bookingId: number; body: Partial<Omit<Booking, "createdAt" | "updatedAt">> }
    >({
      query: ({ bookingId, body }) => ({
        url: `bookings/${bookingId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { bookingId }) => ["Bookings", { type: "Booking", id: bookingId }],
    }),

    /* 🔄 Update booking status */
    updateBookingStatus: builder.mutation<
      { message: string },
      { bookingId: number; status: "Pending" | "Confirmed" | "Cancelled" }
    >({
      query: ({ bookingId, status }) => ({
        url: `bookings/${bookingId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { bookingId }) => ["Bookings", { type: "Booking", id: bookingId }],
    }),

    /* ❌ Cancel booking */
    cancelBooking: builder.mutation<{ message: string }, number>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => ["Bookings", { type: "Booking", id }],
    }),

    /* 🗑️ Delete booking */
    deleteBooking: builder.mutation<{ message: string }, number>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => ["Bookings", { type: "Booking", id }],
    }),
  }),
});

/* Auto‑generated hooks */
export const {
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingsByUserNationalIdQuery,
  useGetBookingsByEventIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
  useDeleteBookingMutation,
} = bookingApi;
