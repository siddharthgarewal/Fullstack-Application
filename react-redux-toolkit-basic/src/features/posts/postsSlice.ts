import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

export interface Post {
  id: number;
  title: string;
}

interface ApiError {
  message: string;
}

interface PostsState {
  items: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  status: "idle",
  error: null,
};

const API_BASE_URL = "http://localhost:3000/api/posts";

async function parseError(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as ApiError;
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function getAuthHeaders(getState: () => RootState) {
  const token = getState().auth.token;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue, getState }) => {
    const response = await fetch(API_BASE_URL, {
      headers: {
        ...getAuthHeaders(getState as () => RootState),
      },
    });

    if (!response.ok) {
      return rejectWithValue(
        await parseError(response, "Failed to fetch posts"),
      );
    }

    return (await response.json()) as Post[];
  },
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (title: string, { rejectWithValue, getState }) => {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(getState as () => RootState),
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      return rejectWithValue(
        await parseError(response, "Failed to create post"),
      );
    }

    return (await response.json()) as Post;
  },
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (
    payload: { id: number; title: string },
    { rejectWithValue, getState },
  ) => {
    const response = await fetch(`${API_BASE_URL}/${payload.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(getState as () => RootState),
      },
      body: JSON.stringify({ title: payload.title }),
    });

    if (!response.ok) {
      return rejectWithValue(
        await parseError(response, "Failed to update post"),
      );
    }

    return (await response.json()) as Post;
  },
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id: number, { rejectWithValue, getState }) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(getState as () => RootState),
      },
    });

    if (!response.ok) {
      return rejectWithValue(
        await parseError(response, "Failed to delete post"),
      );
    }

    return id;
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Something went wrong";
      })
      .addCase(createPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Something went wrong";
      })
      .addCase(updatePost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Something went wrong";
      })
      .addCase(deletePost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Something went wrong";
      });
  },
});

export default postsSlice.reducer;
