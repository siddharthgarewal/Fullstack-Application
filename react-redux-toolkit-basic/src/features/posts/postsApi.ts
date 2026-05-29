import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import { logout, setTokens } from "../auth/authSlice";

export interface Post {
  id: number;
  title: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api/posts",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const refreshToken = (api.getState() as RootState).auth.refreshToken;

  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  const refreshResponse = await fetch(
    "http://localhost:3000/api/auth/refresh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!refreshResponse.ok) {
    api.dispatch(logout());
    return result;
  }

  const refreshPayload = (await refreshResponse.json()) as RefreshResponse;
  api.dispatch(setTokens(refreshPayload));

  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: baseQueryWithRefresh,
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
