import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

export interface Post {
  id: number;
  title: string;
}

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/posts",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Posts"],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map((post) => ({
                type: "Posts" as const,
                id: post.id,
              })),
              { type: "Posts" as const, id: "LIST" },
            ]
          : [{ type: "Posts" as const, id: "LIST" }],
    }),
    createPost: builder.mutation<Post, string>({
      query: (title) => ({
        url: "",
        method: "POST",
        body: { title },
      }),
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),
    updatePost: builder.mutation<Post, { id: number; title: string }>({
      query: ({ id, title }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Posts", id },
        { type: "Posts", id: "LIST" },
      ],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Posts", id },
        { type: "Posts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;
