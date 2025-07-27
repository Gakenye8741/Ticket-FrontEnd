

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

interface FormData{
  eventId: number,
  url: string,
  type: string

}

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://ticket-backend-xv5a.onrender.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['media', 'mediaByEvent', 'mediaByType'],
  endpoints: (builder) => ({
    // ➕ Create Media (with file upload)
    createMedia: builder.mutation({
      query: (formData: FormData) => ({
        url: 'media',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['media'],
    }),

    // 🔄 Update Media
    updateMedia: builder.mutation({
      query: ({ mediaId, ...data }) => ({
        url: `media/${mediaId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['media'],
    }),

    // 📥 Get All Media
    getAllMedia: builder.query({
      query: () => 'media',
      providesTags: ['media'],
    }),

    // 📥 Get Media by Event ID
    getMediaByEventId: builder.query({
      query: (eventId) => `media/event/${eventId}`,
      providesTags: ['mediaByEvent'],
    }),

    // 📥 Get Media by Type
    getMediaByType: builder.query({
      query: (type: 'image' | 'video') => `media/type/${type}`,
      providesTags: ['mediaByType'],
    }),

    // ❌ Delete Media
    deleteMedia: builder.mutation({
      query: (mediaId: number) => ({
        url: `media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['media'],
    }),
  }),
});

export const {
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useGetAllMediaQuery,
  useGetMediaByEventIdQuery,
  useGetMediaByTypeQuery,
  useDeleteMediaMutation,
} = mediaApi;
