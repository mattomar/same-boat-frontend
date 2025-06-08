import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../store/commentSlice"; // Import the fetchComments action
import { Paper, Box, Divider, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import PostCard from "../components/postCard"; // Import PostCard

const PostWithAllComments = () => {
  const { postId } = useParams(); // Get postId from URL params
  const dispatch = useDispatch();

  // Get the post by postId
  const post = useSelector((state) => state.posts.posts.find((p) => p.id === parseInt(postId)));
  const comments = useSelector((state) => state.comments.commentsByPost[postId]);

  // Fetch comments for the post
  useEffect(() => {
    if (!comments) {
      dispatch(fetchComments(postId)); // Fetch comments if not already loaded
    }
  }, [dispatch, postId, comments]);

  if (!post) return <Typography>Post not found</Typography>;

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "16px" }}>
      <PostCard post={post} showAllComments={true} />
    </Paper>
  );
};

export default PostWithAllComments;