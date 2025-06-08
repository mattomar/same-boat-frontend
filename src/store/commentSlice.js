import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3079'; // Adjust if needed

// Fetch comments for a specific post
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token to the request
      },
    });
    return { postId, comments: response.data }; // Return postId and comments as a plain object
  }
);

// Post a new comment
export const postComment = createAsyncThunk(
  'comments/postComment',
  async ({ postId, content }) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const response = await axios.post(
      `${API_URL}/posts/${postId}/comments`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the token to the request
        },
      }
    );
    return response.data; // Return newly posted comment
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    commentsByPost: {}, // { postId: [comments] } --> Store comments by postId
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        // Store comments for the specific postId in the state
        state.commentsByPost[action.payload.postId] = action.payload.comments;
        console.log('Updated comments in Redux store:', state.commentsByPost); // Log the updated state
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        // Add the newly posted comment to the correct post
        state.commentsByPost[postId].push(action.payload);
        console.log('Updated comments after posting:', state.commentsByPost); // Log after adding the new comment
      });
  },
});

export default commentsSlice.reducer;