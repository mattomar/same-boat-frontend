import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../store/postSlice";
import { fetchCategories } from "../store/categorySlice";

const CreatePostForm = () => {
  const dispatch = useDispatch();
  const { items: categories, status } = useSelector((state) => state.category);

  const [form, setForm] = useState({
    title: "",
    content: "",
    categoryId: "",
    photo: null,
    video: null,
    audio: null,
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, status]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    const finalForm = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : "",
    };

    for (let key in finalForm) {
      if (finalForm[key] !== null && finalForm[key] !== undefined) {
        formData.append(key, finalForm[key]);
      }
    }

    console.log("📦 FormData being submitted:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      const result = await dispatch(createPost(formData)).unwrap();
      console.log("✅ Post created:", result);

      setForm({
        title: "",
        content: "",
        categoryId: "",
        photo: null,
        video: null,
        audio: null,
      });
    } catch (error) {
      console.error("❌ Failed to create post:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} bgcolor="#222" borderRadius={2}>
      <Typography variant="h6" mb={2} color="white">Create New Post</Typography>

      <TextField
        fullWidth
        name="title"
        label="Title"
        value={form.title}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ style: { color: "white" } }}
        InputProps={{ style: { color: "white" } }}
      />

      <TextField
        fullWidth
        name="content"
        label="Content"
        multiline
        rows={4}
        value={form.content}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ style: { color: "white" } }}
        InputProps={{ style: { color: "white" } }}
      />

      <TextField
        select
        fullWidth
        name="categoryId"
        label="Category"
        value={form.categoryId}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ style: { color: "white" } }}
        InputProps={{ style: { color: "white" } }}
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>

      <Box mt={2} display="flex" flexDirection="column" gap={1}>
        <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
       
      </Box>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Post
      </Button>
    </Box>
  );
};

export default CreatePostForm;