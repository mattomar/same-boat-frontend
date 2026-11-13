import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../store/commentSlice";
import { fetchPostById } from "../store/postSlice";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import PostCard from "../components/postCard";
import Header from "../components/header";

const PostWithAllComments = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();

  const post = useSelector((state) =>
    state.posts.posts.find((p) => String(p.id) === String(postId)),
  );

  const postLoading = useSelector((state) => state.posts.postLoading);
  const postError = useSelector((state) => state.posts.postError);

  useEffect(() => {
    dispatch(fetchPostById(postId));
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

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
    <>
      <Header />

      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: "16px",
          mx: "auto",
          maxWidth: "1000px",
          mt: 2,
        }}
      >
        <PostCard post={post} showAllComments={true} />
      </Paper>
    </>
  );
};

export default PostWithAllComments;
