import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { fetchComments } from "../store/commentSlice";
import { Paper, Typography, Avatar, Box, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommentInput from "../components/commentInput";
import CommentList from "../components/commentList";

const PostCard = ({ post, showAllComments }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userProfile = useSelector((state) => state.user.profiles[post.user.id]);
  const userLoading = useSelector((state) => state.user.loading);

  const comments = useSelector(
    (state) => state.comments.commentsByPost[post.id],
  );

  useEffect(() => {
    if (!userProfile) {
      dispatch(fetchUserProfile(post.user.id));
    }
  }, [dispatch, post.user.id, userProfile]);

  useEffect(() => {
    if (!comments) {
      dispatch(fetchComments(post.id));
    }
  }, [dispatch, post.id, comments]);

  const handleUserClick = () => {
    navigate(`/profile/${post.user.id}`);
  };

  const handleShowMore = () => {
    navigate(`/post/${post.id}/comments`);
  };

  const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
  const isAvatarValid = avatarUrl && avatarUrl !== "null";

  const visibleComments = comments
    ? showAllComments
      ? comments
      : comments.slice(0, 2)
    : [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "14px",
        color: "#222222",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Author */}
      {userLoading && !userProfile ? (
        <Typography variant="body2" sx={{ color: "#888888" }}>
          Loading profile...
        </Typography>
      ) : userProfile ? (
        <Box
          onClick={handleUserClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
            cursor: "pointer",
            width: "fit-content",
            "&:hover .author-name": {
              color: "#008c9e",
            },
          }}
        >
          <Avatar
            src={isAvatarValid ? avatarUrl : undefined}
            alt={userProfile.username || "Unknown User"}
            sx={{
              width: 44,
              height: 44,
              fontSize: "1rem",
              fontWeight: 600,
              color: "#333333",
              backgroundColor: "#eeeeee",
            }}
          >
            {!isAvatarValid && userProfile.username?.charAt(0).toUpperCase()}
          </Avatar>

          <Typography
            className="author-name"
            variant="body1"
            sx={{
              color: "#222222",
              fontSize: "1rem",
              fontWeight: 700,
              transition: "color 0.2s ease",
            }}
          >
            {userProfile.username || "Unknown User"}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: "#d32f2f" }}>
          User not found
        </Typography>
      )}

      {/* Main Post */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.6rem" },
            fontWeight: 700,
            lineHeight: 1.4,
            mb: 1.5,
            color: "#1a1a1a",
            overflowWrap: "anywhere",
          }}
        >
          {post.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1.05rem", sm: "1.1rem" },
            lineHeight: 1.85,
            color: "#333333",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {post.content}
        </Typography>
      </Box>

      {/* Post Image */}
      {post.photoUrl && (
        <Box sx={{ mb: 3 }}>
          <Box
            component="img"
            src={post.photoUrl}
            alt="Post media"
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 360,
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        </Box>
      )}

      <Divider sx={{ borderColor: "#eeeeee", my: 2 }} />

      {/* Comments */}
      <Box
        sx={{
          backgroundColor: "#f7f7f8",
          borderRadius: "10px",
          p: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: "#777777",
            fontWeight: 600,
            fontSize: "0.75rem",
            mb: 1,
          }}
        >
          Comments {comments ? `(${comments.length})` : ""}
        </Typography>

        {visibleComments.length > 0 ? (
          <Box sx={{ "& > *": { minWidth: 0 } }}>
            <CommentList comments={visibleComments} />
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#888888",
              fontSize: "0.8rem",
              py: 0.5,
            }}
          >
            No comments yet.
          </Typography>
        )}

        {!showAllComments && comments && comments.length > 2 && (
          <Button
            size="small"
            onClick={handleShowMore}
            sx={{
              mt: 0.5,
              px: 0,
              minWidth: 0,
              textTransform: "none",
              color: "#555555",
              fontSize: "0.78rem",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#008c9e",
              },
            }}
          >
            View all {comments.length} comments
          </Button>
        )}
      </Box>

      {/* Comment Input */}
      <Box
        sx={{
          mt: 1.5,
          pt: 1.5,
          borderTop: "1px solid #eeeeee",
        }}
      >
        <CommentInput postId={post.id} />
      </Box>
    </Paper>
  );
};

export default PostCard;
