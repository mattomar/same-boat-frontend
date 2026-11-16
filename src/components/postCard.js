import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { fetchComments, deleteComment } from "../store/commentSlice";
import { deletePost } from "../store/postSlice";

import {
  Paper,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommentInput from "../components/commentInput";
import CommentList from "../components/commentList";

const API_URL = "http://localhost:3079/api";

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Violence or threats",
  "Inappropriate content",
  "False information",
  "Scam or fraud",
  "Other",
];

const PostCard = ({ post, showAllComments }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [postMenuAnchor, setPostMenuAnchor] = useState(null);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const isPostOwner = String(currentUserId) === String(post.user.id);

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
    dispatch(fetchComments(post.id));
  }, [dispatch, post.id]);

  const handleUserClick = () => {
    navigate(`/profile/${post.user.id}`);
  };

  const handleShowMore = () => {
    navigate(`/post/${post.id}/comments`);
  };

  const handleOpenReportDialog = () => {
    setPostMenuAnchor(null);
    setReportReason("");
    setReportDetails("");
    setReportError("");
    setReportSuccess("");
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    if (reportLoading) return;
    setReportDialogOpen(false);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      setReportError("Please select a reason for reporting this post.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      await axios.post(
        `${API_URL}/reports`,
        {
          targetType: "post",
          targetId: post.id,
          reason: reportReason,
          details: reportDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReportDialogOpen(false);
      setReportSuccess("Report submitted successfully.");
      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Failed to submit report:", error);

      if (error.response?.status === 409) {
        setReportError("You have already reported this post.");
      } else {
        setReportError(
          error.response?.data?.error ||
            "Could not submit your report. Please try again.",
        );
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? Its replies will also be deleted.",
    );

    if (!confirmed) return;

    try {
      await dispatch(
        deleteComment({
          commentId,
          postId: post.id,
        }),
      ).unwrap();

      await dispatch(fetchComments(post.id)).unwrap();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(error?.message || "Could not delete comment. Please try again.");
    }
  };

  const handleDeletePost = async () => {
    setPostMenuAnchor(null);

    const confirmed = window.confirm(
      "Are you sure you want to delete this post? All its comments and replies will also be deleted.",
    );

    if (!confirmed) return;

    try {
      await dispatch(deletePost(post.id)).unwrap();
    } catch (error) {
      console.error("Failed to delete post:", error);

      alert(
        typeof error === "string"
          ? error
          : error?.message || "Could not delete post. Please try again.",
      );
    }
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box
            onClick={handleUserClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
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

          <IconButton
            size="small"
            onClick={(event) => setPostMenuAnchor(event.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={postMenuAnchor}
            open={Boolean(postMenuAnchor)}
            onClose={() => setPostMenuAnchor(null)}
          >
            {isPostOwner ? (
              <MenuItem onClick={handleDeletePost} sx={{ color: "error.main" }}>
                <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                Delete post
              </MenuItem>
            ) : (
              <MenuItem onClick={handleOpenReportDialog}>
                <FlagOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Report post
              </MenuItem>
            )}
          </Menu>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: "#d32f2f" }}>
          User not found
        </Typography>
      )}

      {reportSuccess && (
        <Alert
          severity="success"
          onClose={() => setReportSuccess("")}
          sx={{ mb: 2 }}
        >
          {reportSuccess}
        </Alert>
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
            <CommentList
              comments={visibleComments}
              postId={post.id}
              postOwnerId={post.user.id}
              onDeleteComment={handleDeleteComment}
            />
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

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Report post</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Why are you reporting this post? Your report will be reviewed by the
            moderation team.
          </Typography>

          {reportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reportError}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id={`report-reason-${post.id}`}>Reason</InputLabel>
            <Select
              labelId={`report-reason-${post.id}`}
              value={reportReason}
              label="Reason"
              onChange={(event) => setReportReason(event.target.value)}
            >
              {REPORT_REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Additional details (optional)"
            placeholder="Tell us more about the issue..."
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseReportDialog} disabled={reportLoading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleSubmitReport}
            disabled={reportLoading || !reportReason}
          >
            {reportLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Submit report"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PostCard;
