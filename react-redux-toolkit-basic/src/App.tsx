import { useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  fetchCurrentUser,
  loginUser,
  logout,
  registerUser,
} from "./features/auth/authSlice";
import {
  decrement,
  increment,
  incrementByAmount,
  reset,
} from "./features/counter/counterSlice";
import {
  postsApi,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetPostsQuery,
  useUpdatePostMutation,
} from "./features/posts/postsApi";
import "./App.css";

function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Something went wrong";
  }

  const fetchError = error as FetchBaseQueryError;

  if ("data" in fetchError) {
    const data = fetchError.data as { message?: string };
    if (data && typeof data.message === "string") {
      return data.message;
    }
  }

  return "Something went wrong";
}

function App() {
  const [amount, setAmount] = useState(5);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const counter = useAppSelector((state) => state.counter.value);

  const {
    data: items = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPostsQuery(undefined, { skip: !auth.token });
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  const postsLoading =
    isLoading ||
    isFetching ||
    isCreatingPost ||
    isUpdatingPost ||
    isDeletingPost;

  const postsStatus = !auth.token
    ? "unauthenticated"
    : postsLoading
      ? "loading"
      : isError
        ? "failed"
        : "succeeded";

  const postsError = isError ? getApiErrorMessage(error) : null;

  useEffect(() => {
    if (auth.token && !auth.user) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.token, auth.user, dispatch]);

  const handleAuthSubmit = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    if (authMode === "register") {
      if (!name.trim()) {
        return;
      }

      dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      );
      return;
    }

    dispatch(
      loginUser({
        email: email.trim(),
        password: password.trim(),
      }),
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(postsApi.util.resetApiState());
  };

  const handleCreatePost = async () => {
    const trimmedTitle = newPostTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      await createPost(trimmedTitle).unwrap();
      setNewPostTitle("");
    } catch {
      // Keep input so user can retry if request fails.
    }
  };

  const handleStartEditing = (id: number, title: string) => {
    setEditingPostId(id);
    setEditingTitle(title);
  };

  const handleCancelEditing = () => {
    setEditingPostId(null);
    setEditingTitle("");
  };

  const handleSaveEditing = async () => {
    if (editingPostId === null || !editingTitle.trim()) {
      return;
    }

    try {
      await updatePost({
        id: editingPostId,
        title: editingTitle.trim(),
      }).unwrap();
      handleCancelEditing();
    } catch {
      // Keep edit mode open so user can retry.
    }
  };

  return (
    <main className="container">
      <h1>Redux Toolkit Interview Demo</h1>
      <p className="subtitle">
        Covers slices, immutable updates via Immer, typed hooks, and async thunk
        flow.
      </p>

      <section className="panel auth-panel">
        <h2>0) Authentication Flow (JWT)</h2>

        {auth.user ? (
          <div className="auth-user-row">
            <p className="status-line">
              Logged in as <strong>{auth.user.name}</strong> ({auth.user.email})
            </p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <div className="button-row">
              <button
                onClick={() => setAuthMode("login")}
                disabled={authMode === "login"}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("register")}
                disabled={authMode === "register"}
              >
                Register
              </button>
            </div>

            <div className="auth-form">
              {authMode === "register" && (
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (min 6 chars)"
              />
              <button
                onClick={handleAuthSubmit}
                disabled={auth.status === "loading"}
              >
                {auth.status === "loading"
                  ? "Please wait..."
                  : authMode === "register"
                    ? "Create Account"
                    : "Login"}
              </button>
            </div>

            {auth.error && <p className="error">Auth Error: {auth.error}</p>}
          </>
        )}
      </section>

      <section className="panel">
        <h2>1) Counter Slice (Synchronous State)</h2>
        <p className="value">Current Count: {counter}</p>

        <div className="button-row">
          <button onClick={() => dispatch(decrement())}>-1</button>
          <button onClick={() => dispatch(increment())}>+1</button>
          <button onClick={() => dispatch(reset())}>Reset</button>
        </div>

        <div className="amount-row">
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value) || 0)}
          />
          <button onClick={() => dispatch(incrementByAmount(amount))}>
            Add Amount
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>2) RTK Query + CRUD API Integration</h2>
        <button
          onClick={() => refetch()}
          disabled={postsLoading || !auth.token}
        >
          {postsLoading ? "Loading..." : "Fetch Posts"}
        </button>

        <div className="crud-row">
          <input
            type="text"
            value={newPostTitle}
            onChange={(event) => setNewPostTitle(event.target.value)}
            placeholder="Enter new post title"
            className="post-input"
          />
          <button
            onClick={handleCreatePost}
            disabled={postsLoading || !newPostTitle.trim() || !auth.token}
          >
            Add Post
          </button>
        </div>

        {!auth.token && (
          <p className="status-line">Login required to access posts APIs.</p>
        )}

        <p className="status-line">Status: {postsStatus}</p>
        {postsError && <p className="error">Error: {postsError}</p>}

        <ul className="list post-list">
          {items.map((post) => (
            <li key={post.id} className="post-list-item">
              {editingPostId === post.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    className="post-input"
                  />
                  <div className="inline-actions">
                    <button
                      onClick={handleSaveEditing}
                      disabled={postsLoading || !editingTitle.trim()}
                    >
                      Save
                    </button>
                    <button onClick={handleCancelEditing}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span>{post.title}</span>
                  <div className="inline-actions">
                    <button
                      onClick={() => handleStartEditing(post.id, post.title)}
                      disabled={postsLoading || !auth.token}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      disabled={postsLoading || !auth.token}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel notes">
        <h2>Interview Talking Points</h2>
        <ol>
          <li>
            How createSlice removes reducer boilerplate and creates action
            creators.
          </li>
          <li>
            How Immer allows "mutating" syntax with immutable state updates.
          </li>
          <li>
            How createAsyncThunk manages pending/fulfilled/rejected action
            states.
          </li>
          <li>
            Why typed RootState and AppDispatch improve DX and reliability in
            TS.
          </li>
        </ol>
      </section>
    </main>
  );
}

export default App;
