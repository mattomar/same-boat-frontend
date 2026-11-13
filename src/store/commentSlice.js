import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3079";

// Fetch comments for a post
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        postId,
        comments: response.data,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

// Create a comment OR reply
export const postComment = createAsyncThunk(
  "comments/postComment",
  async ({ postId, content, parentId = null }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/posts/${postId}/comments`,
        {
          content,
          parentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        ...response.data,
        postId,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to post comment",
      );
    }
  },
);

// Delete a comment and its replies
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/posts/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { commentId, postId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

// Add a reply to its parent comment
const addReply = (comments, reply) => {
  for (const comment of comments) {
    if (String(comment.id) === String(reply.parentId)) {
      if (!comment.replies) {
        comment.replies = [];
      }

      comment.replies.push(reply);
      return true;
    }

    if (comment.replies?.length) {
      if (addReply(comment.replies, reply)) {
        return true;
      }
    }
  }

  return false;
};

// Remove a comment recursively
const removeComment = (comments, commentId) => {
  return comments
    .filter((comment) => String(comment.id) !== String(commentId))
    .map((comment) => ({
      ...comment,
      replies: comment.replies ? removeComment(comment.replies, commentId) : [],
    }));
};

const commentsSlice = createSlice({
  name: "comments",

  initialState: {
    commentsByPost: {},
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;

        state.commentsByPost[action.payload.postId] = action.payload.comments;
      })

      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Create comment or reply
      .addCase(postComment.fulfilled, (state, action) => {
        const newComment = action.payload;
        const postId = newComment.postId;

        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }

        if (newComment.parentId) {
          addReply(state.commentsByPost[postId], newComment);
        } else {
          state.commentsByPost[postId].push(newComment);
        }

        state.error = null;
      })

      .addCase(postComment.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, postId } = action.payload;

        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId] = removeComment(
            state.commentsByPost[postId],
            commentId,
          );
        }
      })

      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default commentsSlice.reducer;
