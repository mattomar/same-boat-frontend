import React, { useEffect } from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice"; // Import user profile fetch

const CommentList = ({ comments }) => {
  const dispatch = useDispatch();

  // Loop through each comment to fetch the user profile if not already fetched
  comments.forEach((comment) => {
    const userProfile = useSelector((state) => state.user.profiles[comment.userId]);

    // If the profile is not loaded yet, dispatch the fetchUserProfile action
    useEffect(() => {
      if (!userProfile) {
        dispatch(fetchUserProfile(comment.userId)); // Fetch user profile based on comment's userId
      }
    }, [dispatch, comment.userId, userProfile]);
  });

  return (
    <Box mt={2}>
      {comments.length === 0 ? (
        <Typography>No comments yet</Typography>
      ) : (
        comments.map((comment) => {
          const userProfile = useSelector(
            (state) => state.user.profiles[comment.userId]
          );

          const avatarUrl = userProfile?.profile?.avatarUrl?.trim();
          const isAvatarValid = avatarUrl && avatarUrl !== "null" && avatarUrl !== "";
          const username = userProfile?.username || "Unknown User";

          return (
            <Box key={comment.id} mb={2}>
              <Box display="flex" alignItems="flex-start" mb={1}>
                <Avatar
                  src={isAvatarValid ? avatarUrl : undefined}
                  alt={username}
                  sx={{
                    mr: 1,
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                  }}
                  onClick={() => window.location.href = `/profile/${comment.userId}`} // Navigate to profile on click
                >
                  {!isAvatarValid && username.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{
                        cursor: "pointer",
                        mr: 1,
                      }}
                      onClick={() => window.location.href = `/profile/${comment.userId}`}
                    >
                      {username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {/* Add any additional date or meta information here if needed */}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>
              {/* Divider for separating comments */}
              <Divider sx={{ marginY: 1 }} />
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default CommentList;
