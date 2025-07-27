// features/APIS/EmailApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emailApi = createApi({
  reducerPath: 'emailApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://ticket-backend-xv5a.onrender.com/api/' }),
  endpoints: (builder) => ({
    sendTicketEmail: builder.mutation<void, { bookings: any[]; user: any }>({
      query: (body) => ({
        url: '/send-ticket-email',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendTicketEmailMutation } = emailApi;
