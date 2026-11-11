import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPostApi } from "../utils/api";
import axios from "axios";

const API_URL = "http://localhost:3079";

// Fetch posts by category
export const fetchPostsByCategory = createAsyncThunk(
  "posts/fetchByCategory",
  async (categoryId) => {
    const response = await axios.get(`${API_URL}/posts/category/${categoryId}`);
    return response.data;
  },
);

// Fetch posts by user
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/posts/user/${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user posts",
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
        state.error = action.error.message;
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
