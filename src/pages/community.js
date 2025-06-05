import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/categorySlice";
import { fetchPostsByCategory } from "../store/postSlice";
import {
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import PostCard from "../components/postCard"; // <-- make sure the path is correct

const CategoryTabs = () => {
  const dispatch = useDispatch();

  const { items: categories, status: categoryStatus } = useSelector((state) => state.category);
  const { posts, loading, error } = useSelector((state) => state.posts);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory !== null) {
      dispatch(fetchPostsByCategory(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  if (categoryStatus !== "succeeded") return <CircularProgress />;

  return (
    <Box>
      {/* Tabs */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "contained" : "outlined"}
            sx={{
              borderRadius: "16px",
              padding: "12px 24px",
              textTransform: "none",
              backgroundColor: selectedCategory === category.id ? "#1976d2" : "white",
              color: selectedCategory === category.id ? "white" : "#1976d2",
              borderColor: "#1976d2",
              "&:hover": {
                backgroundColor: selectedCategory === category.id ? "#1565c0" : "#f0f0f0",
              },
            }}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </Box>

      {/* Posts */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : posts.length > 0 ? (
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No posts in this category.</Typography>
      )}
    </Box>
  );
};

export default CategoryTabs;