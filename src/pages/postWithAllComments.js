import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../store/commentSlice";
import { fetchPostById } from "../store/postSlice";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import PostCard from "../components/postCard";

const PostWithAllComments = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();

  const post = useSelector((state) =>
    state.posts.posts.find((p) => String(p.id) === String(postId)),
  );

  const postLoading = useSelector((state) => state.posts.postLoading);

  const postError = useSelector((state) => state.posts.postError);

  const comments = useSelector(
    (state) => state.comments.commentsByPost[postId],
  );

  // Fetch post if it isn't already in Redux
  useEffect(() => {
    if (!post) {
      dispatch(fetchPostById(postId));
    }
  }, [dispatch, postId, post]);

  // Fetch comments
  useEffect(() => {
    if (!comments) {
      dispatch(fetchComments(postId));
    }
  }, [dispatch, postId, comments]);

  if (postLoading && !post) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (postError && !post) {
    return <Typography>{postError}</Typography>;
  }

  if (!post) {
    return <Typography>Post not found</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "16px" }}>
      <PostCard post={post} showAllComments={true} />
    </Paper>
  );
};

export default PostWithAllComments;
