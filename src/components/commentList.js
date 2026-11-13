import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useDispatch, useSelector } from "react-redux";
import { fetchComments, postComment } from "../store/commentSlice";
import { fetchUserProfile } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const CommentList = ({
  comments = [],
  postId,
  postOwnerId,
  onDeleteComment,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userProfiles = useSelector((state) => state.user.profiles);

  const currentUserId = localStorage.getItem("userId");

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Tracks which original comments have expanded replies.
  const [expandedReplies, setExpandedReplies] = useState({});

  // Flatten nested comments to fetch every author's profile.
  const flattenComments = (commentList) => {
    return commentList.flatMap((comment) => [
      comment,
      ...flattenComments(comment.replies || []),
    ]);
  };

  useEffect(() => {
    const allComments = flattenComments(comments);

    allComments.forEach((comment) => {
      if (comment.userId && !userProfiles[comment.userId]) {
        dispatch(fetchUserProfile(comment.userId));
      }
    });
  }, [comments, userProfiles, dispatch]);

  // Get username from profile or included backend user data.
  const getUsername = (comment) => {
    return (
      userProfiles[comment.userId]?.username ||
      comment.user?.username ||
      "Unknown User"
    );
  };

  // Navigate to a user's profile.
  const openProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Render avatar.
  const renderAvatar = (comment, size = 32) => {
    const userProfile = userProfiles[comment.userId];
    const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
    const username = getUsername(comment);

    return (
      <Avatar
        src={avatarUrl || undefined}
        sx={{
          width: size,
          height: size,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => openProfile(comment.userId)}
      >
        {!avatarUrl && username.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  // Check comment deletion permissions.
  const canDeleteComment = (comment) => {
    return (
      Boolean(currentUserId) &&
      (String(currentUserId) === String(comment.userId) ||
        String(currentUserId) === String(postOwnerId))
    );
  };

  // Delete menu.
  const renderDeleteButton = (comment) => {
    if (!canDeleteComment(comment)) return null;

    return (
      <IconButton
        size="small"
        onClick={(event) => {
          setMenuAnchor(event.currentTarget);
          setSelectedComment(comment);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    );
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = () => {
    if (selectedComment && onDeleteComment) {
      onDeleteComment(selectedComment.id);
    }

    handleCloseMenu();
  };

  // Open reply input and automatically mention the parent author.
  const handleReplyClick = (comment) => {
    const username = getUsername(comment);

    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setReplyContent("");
      setReplyError("");
      return;
    }

    setReplyingTo(comment.id);
    setReplyContent(`@${username} `);
    setReplyError("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
    setReplyError("");
  };

  // Submit a reply to ANY comment.
  const handleSubmitReply = async (parentCommentId) => {
    const content = replyContent.trim();

    if (!content || submittingReply) return;

    if (!postId) {
      setReplyError("Post ID is missing.");
      return;
    }

    try {
      setSubmittingReply(true);
      setReplyError("");

      await dispatch(
        postComment({
          postId,
          content,
          parentId: parentCommentId,
        }),
      ).unwrap();

      // Refresh the complete nested comment structure.
      await dispatch(fetchComments(postId)).unwrap();

      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      setReplyError(
        typeof error === "string"
          ? error
          : "Could not post reply. Please try again.",
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  // Render @mentions as blue clickable usernames.
  const renderCommentContent = (content, parentComment = null) => {
    const parts = content.split(/(@[A-Za-z0-9_.-]+)/g);

    return parts.map((part, index) => {
      if (!part.startsWith("@")) {
        return <React.Fragment key={index}>{part}</React.Fragment>;
      }

      const mentionedUsername = part.slice(1);
      let mentionedUserId = null;

      // Check whether this is the person being replied to.
      if (
        parentComment &&
        getUsername(parentComment).toLowerCase() ===
          mentionedUsername.toLowerCase()
      ) {
        mentionedUserId = parentComment.userId;
      } else {
        // Otherwise check loaded user profiles.
        const matchingProfile = Object.entries(userProfiles).find(
          ([userId, profile]) =>
            profile?.username?.toLowerCase() ===
            mentionedUsername.toLowerCase(),
        );

        if (matchingProfile) {
          mentionedUserId = matchingProfile[0];
        }
      }

      return (
        <Typography
          key={index}
          component="span"
          onClick={
            mentionedUserId ? () => openProfile(mentionedUserId) : undefined
          }
          sx={{
            color: "primary.main",
            fontWeight: 600,
            cursor: mentionedUserId ? "pointer" : "default",
            "&:hover": mentionedUserId ? { textDecoration: "underline" } : {},
          }}
        >
          {part}
        </Typography>
      );
    });
  };

  // Render an individual comment.
  const renderComment = (comment, depth = 0, parentComment = null) => {
    const username = getUsername(comment);
    const isReplying = replyingTo === comment.id;

    return (
      <Box
        key={comment.id}
        sx={{
          mt: depth === 0 ? 0 : 1.5,
          ml: depth === 0 ? 0 : 2,
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={1}>
          {renderAvatar(comment, depth === 0 ? 32 : 28)}

          <Box flex={1} minWidth={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                fontWeight={700}
                fontSize="0.875rem"
                sx={{ cursor: "pointer" }}
                onClick={() => openProfile(comment.userId)}
              >
                {username}
              </Typography>

              {renderDeleteButton(comment)}
            </Box>

            <Typography
              variant="body2"
              sx={{
                overflowWrap: "anywhere",
                lineHeight: 1.5,
              }}
            >
              {renderCommentContent(comment.content, parentComment)}
            </Typography>

            {/* Small Reply text */}
            <Typography
              component="span"
              onClick={() => handleReplyClick(comment)}
              sx={{
                display: "inline-block",
                mt: 0.5,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "text.secondary",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Reply
            </Typography>

            {/* Reply input */}
            {isReplying && (
              <Box mt={1}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  maxRows={3}
                  placeholder={`Reply to ${username}...`}
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                />

                {replyError && (
                  <Typography variant="caption" color="error">
                    {replyError}
                  </Typography>
                )}

                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  gap={1.5}
                  mt={0.75}
                >
                  <Typography
                    component="span"
                    onClick={handleCancelReply}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </Typography>

                  <Typography
                    component="span"
                    onClick={() => handleSubmitReply(comment.id)}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "primary.main",
                      cursor:
                        submittingReply || !replyContent.trim()
                          ? "default"
                          : "pointer",
                      opacity:
                        submittingReply || !replyContent.trim() ? 0.5 : 1,
                    }}
                  >
                    {submittingReply ? "Posting..." : "Post"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Collect all descendants of an original comment in display order.
  const getAllReplies = (comment) => {
    const result = [];

    const collect = (currentComment) => {
      (currentComment.replies || []).forEach((reply) => {
        result.push(reply);
        collect(reply);
      });
    };

    collect(comment);

    return result;
  };

  // Toggle replies for an original comment.
  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Render replies in a flat visual list, preserving their actual parents.
  const renderAllReplies = (rootComment) => {
    const allReplies = getAllReplies(rootComment);
    const isExpanded = Boolean(expandedReplies[rootComment.id]);

    const visibleReplies = isExpanded ? allReplies : allReplies.slice(0, 2);

    // Map each reply to its actual parent.
    const parentMap = {};

    const buildParentMap = (comment) => {
      (comment.replies || []).forEach((reply) => {
        parentMap[reply.id] = comment;
        buildParentMap(reply);
      });
    };

    buildParentMap(rootComment);

    return (
      <>
        {visibleReplies.map((reply) => (
          <React.Fragment key={reply.id}>
            {renderComment(reply, 1, parentMap[reply.id])}
          </React.Fragment>
        ))}

        {allReplies.length > 2 && (
          <Typography
            component="span"
            onClick={() => toggleReplies(rootComment.id)}
            sx={{
              display: "inline-block",
              mt: 1,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "text.secondary",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            {isExpanded
              ? "Hide replies"
              : `Show ${allReplies.length - 2} more replies`}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box mt={2}>
      {comments.length === 0 ? (
        <Typography variant="body2">No comments yet</Typography>
      ) : (
        comments.map((comment, index) => (
          <Box key={comment.id} mb={2}>
            {renderComment(comment)}

            {/* All nested replies share the same visual level */}
            {comment.replies?.length > 0 && (
              <Box
                mt={1}
                ml={2}
                pl={1.5}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: "divider",
                }}
              >
                {renderAllReplies(comment)}
              </Box>
            )}

            {index !== comments.length - 1 && <Divider sx={{ mt: 1.5 }} />}
          </Box>
        ))
      )}

      {/* Delete menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDeleteComment} sx={{ color: "error.main" }}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Delete comment
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommentList;
