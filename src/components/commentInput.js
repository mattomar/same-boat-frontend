import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { postComment } from "../store/commentSlice"; // Import the postComment action

const CommentInput = ({ postId }) => {
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (content.trim()) {
      dispatch(postComment({ postId, content }));
      setContent(""); // Reset the input after submitting
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        width: "100%",
        padding: "8px",
        borderRadius: "12px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <TextField
        variant="outlined"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        fullWidth
        size="small"
        sx={{
          borderRadius: "8px",
          flex: 1,
          "& .MuiOutlinedInput-root": {
            height: "40px", // make the input compact
            paddingRight: "8px", // space for the button
          },
          "& .MuiInputBase-input": {
            padding: "8px", // adjust padding for a clean look
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: "#3f51b5",
          height: "40px", // match height with the input
          padding: "0 16px", // control button padding
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#303f9f", // darken on hover
          },
        }}
      >
        Post
      </Button>
    </Box>
  );
};

export default CommentInput;