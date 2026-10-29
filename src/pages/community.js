import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/categorySlice";
import { fetchPostsByCategory } from "../store/postSlice";
import { Box, Button, Typography, Grid, CircularProgress } from "@mui/material";
import PostCard from "../components/postCard";
import Header from "../components/header";

const CategoryTabs = () => {
  const dispatch = useDispatch();

  const { items: categories, status: categoryStatus } = useSelector(
    (state) => state.category,
  );
  const { posts, loading, error } = useSelector((state) => state.posts);

  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const defaultCategory =
        categories.find((cat) => cat.name === "TV/MOVIES") || categories[0];

      setSelectedCategory(defaultCategory.id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchPostsByCategory(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  return (
    <>
      <Header />

      {categoryStatus !== "succeeded" ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress sx={{ color: "#00e5ff" }} />
        </Box>
      ) : (
        <Box sx={{ width: "100%", color: "white", px: 2 }}>
          {/* Category tabs */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 4,
              mt: 3,
            }}
          >
            {categories.map((category) => {
              const selected = selectedCategory === category.id;

              return (
                <Button
                  key={category.id}
                  variant="outlined"
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    borderRadius: "8px",
                    px: 2,
                    py: 0.8,
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: selected ? 600 : 400,
                    color: selected ? "#00e5ff" : "rgba(255,255,255,0.75)",
                    backgroundColor: "transparent",
                    borderColor: selected
                      ? "#00e5ff"
                      : "rgba(255,255,255,0.22)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: selected
                        ? "#00e5ff"
                        : "rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  {category.name}
                </Button>
              );
            })}
          </Box>

          {/* Posts */}
          {loading ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress sx={{ color: "#00e5ff" }} />
            </Box>
          ) : error ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#ff8a80" }}>Error: {error}</Typography>
            </Box>
          ) : selectedCategory !== "" && posts.length > 0 ? (
            <Grid container spacing={2}>
              {posts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                minHeight: 350,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              >
                No posts yet
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.9rem",
                }}
              >
                Be the first to start a conversation.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default CategoryTabs;
