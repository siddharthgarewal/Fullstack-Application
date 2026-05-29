import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const ACCESS_TOKEN_STORAGE_KEY = "auth_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "auth_refresh_token";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface MeResponse {
  user: AuthUser;
}

interface AuthPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthPayload {
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const API_BASE_URL = "http://localhost:3000/api/auth";

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  status: "idle",
  error: null,
};

async function parseError(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function saveTokens(accessToken: string | null, refreshToken: string | null) {
  if (!accessToken || !refreshToken) {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/registerUser", async (payload, { rejectWithValue }) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return rejectWithValue(await parseError(response, "Failed to register"));
  }

  return (await response.json()) as AuthResponse;
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  AuthPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return rejectWithValue(await parseError(response, "Failed to login"));
  }

  return (await response.json()) as AuthResponse;
});

export const refreshAuthToken = createAsyncThunk<
  RefreshResponse,
  void,
  { state: RootState; rejectValue: string }
>("auth/refreshAuthToken", async (_, { getState, rejectWithValue }) => {
  const refreshToken = getState().auth.refreshToken;

  if (!refreshToken) {
    return rejectWithValue("No refresh token found");
  }

  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    return rejectWithValue(
      await parseError(response, "Failed to refresh auth token"),
    );
  }

  return (await response.json()) as RefreshResponse;
});

export const logoutUser = createAsyncThunk<void, void, { state: RootState }>(
  "auth/logoutUser",
  async (_, { getState }) => {
    const refreshToken = getState().auth.refreshToken;

    if (!refreshToken) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore logout network failures and clear client session anyway.
    }
  },
);

export const fetchCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { state: RootState; rejectValue: string }
>("auth/fetchCurrentUser", async (_, thunkApi) => {
  const { getState, dispatch, rejectWithValue } = thunkApi;
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue("No auth token found");
  }

  let response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const refreshResult = await dispatch(refreshAuthToken());

    if (refreshAuthToken.rejected.match(refreshResult)) {
      return rejectWithValue("Invalid or expired token");
    }

    const nextAccessToken = refreshResult.payload.accessToken;

    response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${nextAccessToken}`,
      },
    });
  }

  if (!response.ok) {
    return rejectWithValue(
      await parseError(response, "Failed to fetch current user"),
    );
  }

  const data = (await response.json()) as MeResponse;
  return data.user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action: { payload: RefreshResponse }) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.status = "idle";
      saveTokens(null, null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
        if (action.payload === "Invalid or expired token") {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          saveTokens(null, null);
        }
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.status = "idle";
        saveTokens(null, null);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
        state.status = "idle";
        saveTokens(null, null);
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
