import React, { useEffect } from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const CommentList = ({ comments }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userProfiles = useSelector((state) => state.user.profiles);

  useEffect(() => {
    comments.forEach((comment) => {
      if (!userProfiles[comment.userId]) {
        dispatch(fetchUserProfile(comment.userId));
      }
    });
  }, [comments, userProfiles, dispatch]);

  return (
    <Box mt={2}>
      {comments.length === 0 ? (
        <Typography>No comments yet</Typography>
      ) : (
        comments.map((comment) => {
          const userProfile = userProfiles[comment.userId];

          const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
          const username = userProfile?.username || "Unknown User";

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

                <Box>
                  <Typography
                    fontWeight="bold"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${comment.userId}`)}
                  >
                    {username}
                  </Typography>

                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default CommentList;
