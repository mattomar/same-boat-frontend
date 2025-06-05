import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const BASE_URL = "http://localhost:3079"; // ← adjust if deploying

export const fetchCategories = createAsyncThunk(
    "categories/fetchAll",
    async () => {
      const response = await axios.get(`${BASE_URL}/posts/categories`);
      return response.data;
    }
  );

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      });
  },
});

export default categorySlice.reducer;