import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { Paper, Typography, Avatar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user profile by userId from post.user.id
  const userProfile = useSelector((state) => state.user.profiles[post.user.id]);
  console.log('userProfile in PostCard:', userProfile);
  const userLoading = useSelector((state) => state.user.loading);

  // Fetch user profile if not found in the store
  useEffect(() => {
    if (!userProfile) {
      dispatch(fetchUserProfile(post.user.id)); // Fetch based on post.user.id
    }
  }, [dispatch, post.user.id, userProfile]);

  const handleUserClick = () => {
    navigate(`/profile/${post.user.id}`);
  };

  // Check if avatar URL exists and is valid
  const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
const isAvatarValid = avatarUrl && avatarUrl !== 'null' && avatarUrl !== '';
console.log("Avatar URL in PostCard:", avatarUrl);

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "16px" }}>
      {/* User Info */}
      {userLoading && !userProfile ? (
        <Typography>Loading...</Typography>
      ) : userProfile ? (
        <Box
          display="flex"
          alignItems="center"
          mb={1}
          onClick={handleUserClick}
          sx={{ cursor: "pointer" }}
        >
          {/* Avatar with conditional rendering for fallback */}
          <Avatar
            src={isAvatarValid ? avatarUrl : undefined} // Only use avatarUrl if valid
            alt={userProfile.username || "Unknown User"} // Fallback if username is missing
            sx={{ mr: 1 }}
          >
            {/* If avatarUrl is missing or invalid, display first letter of username */}
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
      <Typography variant="h6">{post.title}</Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {post.content}
      </Typography>

      {/* Media */}
      {post.photoUrl && (
        <Box mb={1}>
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

      {post.videoUrl && (
        <Box mb={1}>
          <video
            controls
            src={post.videoUrl}
            style={{
              width: "100%",
              borderRadius: "12px",
              maxHeight: 300,
            }}
          />
        </Box>
      )}

      {post.audioUrl && (
        <Box>
          <audio controls style={{ width: "100%" }}>
            <source src={post.audioUrl} />
            Your browser does not support the audio element.
          </audio>
        </Box>
      )}

      {post.gifUrl && (
        <Box mb={1}>
          <img
            src={post.gifUrl}
            alt="Post GIF"
            style={{
              width: "100%",
              borderRadius: "12px",
              maxHeight: 300,
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      {post.youtubeUrl && (
        <Box mb={1}>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${post.youtubeUrl.split("v=")[1]}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "12px" }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default PostCard;