import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const CommentList = ({ comments, postOwnerId, onDeleteComment }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userProfiles = useSelector((state) => state.user.profiles);

  // Get logged-in user ID from localStorage
  const currentUserId = localStorage.getItem("userId");

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    comments.forEach((comment) => {
      if (!userProfiles[comment.userId]) {
        dispatch(fetchUserProfile(comment.userId));
      }
    });
  }, [comments, userProfiles, dispatch]);

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

  return (
    <Box mt={2}>
      {comments.length === 0 ? (
        <Typography>No comments yet</Typography>
      ) : (
        comments.map((comment) => {
          const userProfile = userProfiles[comment.userId];

          const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
          const username = userProfile?.username || "Unknown User";

          const canDelete =
            Boolean(currentUserId) &&
            (String(currentUserId) === String(comment.userId) ||
              String(currentUserId) === String(postOwnerId));

          return (
            <Box key={comment.id} mb={2}>
              <Box display="flex" alignItems="flex-start" mb={1}>
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{ mr: 1, width: 32, height: 32, cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${comment.userId}`)}
                >
                  {!avatarUrl && username.charAt(0).toUpperCase()}
                </Avatar>

                <Box flex={1}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${comment.userId}`)}
                    >
                      {username}
                    </Typography>

                    {canDelete && (
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setMenuAnchor(event.currentTarget);
                          setSelectedComment(comment);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />
            </Box>
          );
        })
      )}

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
