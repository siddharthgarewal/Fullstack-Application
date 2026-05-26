import { useEffect, useState } from "react";
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
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
} from "./features/posts/postsSlice";
import "./App.css";

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
  const { items, status, error } = useAppSelector((state) => state.posts);

  useEffect(() => {
    if (auth.token && !auth.user) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.token, auth.user, dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchPosts());
    }
  }, [auth.token, dispatch]);

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
  };

  const handleCreatePost = () => {
    const trimmedTitle = newPostTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    dispatch(createPost(trimmedTitle));
    setNewPostTitle("");
  };

  const handleStartEditing = (id: number, title: string) => {
    setEditingPostId(id);
    setEditingTitle(title);
  };

  const handleCancelEditing = () => {
    setEditingPostId(null);
    setEditingTitle("");
  };

  const handleSaveEditing = () => {
    if (editingPostId === null || !editingTitle.trim()) {
      return;
    }

    dispatch(updatePost({ id: editingPostId, title: editingTitle.trim() }));
    handleCancelEditing();
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
        <h2>2) Async Thunk + CRUD API Integration</h2>
        <button
          onClick={() => dispatch(fetchPosts())}
          disabled={status === "loading" || !auth.token}
        >
          {status === "loading" ? "Loading..." : "Fetch Posts"}
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
            disabled={
              status === "loading" || !newPostTitle.trim() || !auth.token
            }
          >
            Add Post
          </button>
        </div>

        {!auth.token && (
          <p className="status-line">Login required to access posts APIs.</p>
        )}

        <p className="status-line">Status: {status}</p>
        {error && <p className="error">Error: {error}</p>}

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
                      disabled={status === "loading" || !editingTitle.trim()}
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
                      disabled={status === "loading" || !auth.token}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(deletePost(post.id))}
                      disabled={status === "loading" || !auth.token}
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
