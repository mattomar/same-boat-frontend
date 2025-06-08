import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { fetchComments } from "../store/commentSlice"; // Import the fetchComments action
import { Paper, Typography, Avatar, Box, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommentInput from "../components/commentInput"; // Import the CommentInput
import CommentList from "../components/commentList"; // Import the CommentList

const PostCard = ({ post, showAllComments }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user profile by userId from post.user.id
  const userProfile = useSelector((state) => state.user.profiles[post.user.id]);
  const userLoading = useSelector((state) => state.user.loading);

  // Fetch user profile if not found in the store
  useEffect(() => {
    if (!userProfile) {
      dispatch(fetchUserProfile(post.user.id)); // Fetch based on post.user.id
    }
  }, [dispatch, post.user.id, userProfile]);

  // Fetch comments for the post
  const comments = useSelector((state) => state.comments.commentsByPost[post.id]);

  useEffect(() => {
    if (!comments) {
      dispatch(fetchComments(post.id)); // Fetch comments if not already loaded
    }
  }, [dispatch, post.id, comments]);

  const handleUserClick = () => {
    navigate(`/profile/${post.user.id}`);
  };

  // Check if avatar URL exists and is valid
  const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
  const isAvatarValid = avatarUrl && avatarUrl !== 'null' && avatarUrl !== '';

  // Handle navigation to a new page to show all comments
  const handleShowMore = () => {
    navigate(`/post/${post.id}/comments`);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "16px" }}>
      {/* User Info */}
      {userLoading && !userProfile ? (
        <Typography>Loading...</Typography>
      ) : userProfile ? (
        <Box
          display="flex"
          alignItems="center"
          mb={2} // Increased margin for better spacing
          onClick={handleUserClick}
          sx={{ cursor: "pointer" }}
        >
          <Avatar
            src={isAvatarValid ? avatarUrl : undefined}
            alt={userProfile.username || "Unknown User"}
            sx={{ mr: 1 }}
          >
            {!isAvatarValid && userProfile.username && userProfile.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">
            {userProfile.username || "Unknown User"}
          </Typography>
        </Box>
      ) : (
        <Typography color="error">User not found</Typography>
      )}

      {/* Post Content */}
      <Typography variant="h6" fontWeight="bold">{post.title}</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {post.content}
      </Typography>

      {/* Media */}
      {post.photoUrl && (
        <Box mb={2}>
          <img
            src={post.photoUrl}
            alt="Post media"
            style={{
              width: "100%",
              borderRadius: "12px",
              maxHeight: 300,
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      {/* Divider to Separate Comments Section */}
      <Divider sx={{ mb: 2 }} />

      {/* Comments Section */}
      <Typography variant="h6" fontWeight="bold" mb={1}>Comments</Typography>

      {/* Comment List */}
      <Box
        sx={{
          backgroundColor: "#f9f9f9", // Light background for comments
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)", // Slight shadow to separate visually
        }}
      >
        <CommentList comments={comments ? (showAllComments ? comments : comments.slice(0, 2)) : []} />
      </Box>

      {/* Show More Button */}
      {!showAllComments && comments && comments.length > 2 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" onClick={handleShowMore}>
            Show More
          </Button>
        </Box>
      )}

      {/* Comment Input */}
      <Box mt={2}>
        <CommentInput postId={post.id} />
      </Box>
    </Paper>
  );
};

export default PostCard;