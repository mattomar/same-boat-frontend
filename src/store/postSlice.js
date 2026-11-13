import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPostApi } from "../utils/api";
import axios from "axios";

const API_URL = "http://localhost:3079";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Fetch posts by category
export const fetchPostsByCategory = createAsyncThunk(
  "posts/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/posts/category/${categoryId}`,
        authConfig(),
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch category posts",
      );
    }
  },
);

// Fetch posts by user
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/posts/user/${userId}`,
        authConfig(),
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user posts",
      );
    }
  },
);

// Fetch a single post by ID
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/posts/${postId}`,
        authConfig(),
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch post",
      );
    }
  },
);

// Create a post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await createPostApi(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

// Delete a post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return postId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete post",
      );
    }
  },
);

const postSlice = createSlice({
  name: "posts",

  initialState: {
    posts: [],
    loading: false,
    error: null,
    postLoading: false,
    postError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch category posts
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.posts = [];
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPostsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch user posts
      .addCase(fetchPostsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.posts = [];
      })
      .addCase(fetchPostsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPostsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch single post
      .addCase(fetchPostById.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.postLoading = false;

        const existingIndex = state.posts.findIndex(
          (post) => String(post.id) === String(action.payload.id),
        );

        if (existingIndex !== -1) {
          state.posts[existingIndex] = action.payload;
        } else {
          state.posts.push(action.payload);
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload || action.error.message;
      })

      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(
          (post) => String(post.id) !== String(action.payload),
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default postSlice.reducer;
