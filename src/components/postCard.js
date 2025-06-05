import React from "react";
import { Paper, Typography, Avatar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/profile/${post.user.id}`);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "16px" }}>
      {/* User Info */}
      <Box display="flex" alignItems="center" mb={1} onClick={handleUserClick} sx={{ cursor: "pointer" }}>
        <Avatar src={post.user.profilePicture} alt={post.user.username} sx={{ mr: 1 }} />
        <Typography variant="subtitle2" fontWeight="bold">
          {post.user.username}
        </Typography>
      </Box>

      {/* Title & Content */}
      <Typography variant="h6">{post.title}</Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {post.content}
      </Typography>

      {/* Media Section */}
      {post.photoUrl && (
        <Box mb={1}>
          <img
            src={post.photoUrl}
            alt="Post media"
            style={{ width: "100%", borderRadius: "12px", maxHeight: 300, objectFit: "cover" }}
          />
        </Box>
      )}

      {post.videoUrl && (
        <Box mb={1}>
          <video
            controls
            src={post.videoUrl}
            style={{ width: "100%", borderRadius: "12px", maxHeight: 300 }}
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
    </Paper>
  );
};

export default PostCard;