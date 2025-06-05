import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPostApi } from "../utils/api";
import axios from "axios";

const BASE_URL = "http://localhost:3079"; // ← adjust if deploying

export const fetchPostsByCategory = createAsyncThunk(
  "posts/fetchByCategory",
  async (categoryId) => {
    const response = await axios.get(`${BASE_URL}/posts/category/${categoryId}`);
    return response.data;
  }
);
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await createPostApi(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
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
        .addCase(fetchPostsByCategory.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
          state.loading = false;
          state.posts = action.payload;
        })
        .addCase(fetchPostsByCategory.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        .addCase(createPost.fulfilled, (state, action) => {
          state.posts.unshift(action.payload); // adds new post to top
        });
    },
  });
  
  export default postSlice.reducer;
  