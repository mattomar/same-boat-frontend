import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../store/postSlice";
import { PhotoCamera, Gif, YouTube } from "@mui/icons-material"; // Import YouTube Icon
import GiphyPicker from "../components/giphyPicker"; // 🔁 Imported reusable component

const CreatePostForm = ({ categories }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.category);

  const [form, setForm] = useState({
    content: "",
    categoryId: "",
    photo: null,
    gifUrl: "",
    youtubeUrl: "",  // Store YouTube URL
  });

  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState(""); // Manage the YouTube input state
  const [errors, setErrors] = useState({
    content: false,
    categoryId: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields
    const newErrors = {
      content: !form.content,
      categoryId: !form.categoryId,
    };
    setErrors(newErrors);

    // If there's any validation error, stop the submission
    if (Object.values(newErrors).includes(true)) {
      return;
    }

    const formData = new FormData();
    const finalForm = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : "",
    };

    // Append photo, gifUrl, and youtubeUrl to formData
    for (let key in finalForm) {
      if (finalForm[key] !== null && finalForm[key] !== undefined) {
        formData.append(key, finalForm[key]);
      }
    }

    try {
      const result = await dispatch(createPost(formData)).unwrap();
      console.log("✅ Post created:", result);

      setForm({
        content: "",
        categoryId: "",
        photo: null,
        gifUrl: "",
        youtubeUrl: "",  // Reset after submit
      });
      setYoutubeUrlInput("");  // Reset the YouTube URL input as well
    } catch (error) {
      console.error("❌ Failed to create post:", error);
    }
  };

  const handleYouTubeClick = () => {
    setYoutubeUrlInput(""); // Reset input when YouTube button is clicked
  };

  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrlInput(e.target.value);
  };

  const handleYoutubeUrlSubmit = () => {
    setForm({ ...form, youtubeUrl: youtubeUrlInput });
    setYoutubeUrlInput(""); // Clear the input field after submission
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      p={2}
      borderRadius={3}
      maxWidth="500px"  // Set a max width for the form
      m="0 auto"  // Center the form
      display="flex"
      flexDirection="column"
      gap={2} // Adding a small gap between elements
    >
      {/* Content Text Field */}
      <TextField
        fullWidth
        placeholder="What's on your mind?"
        name="content"
        multiline
        rows={2}  // Shorter height
        value={form.content}
        onChange={handleChange}
        margin="dense"
        variant="filled"
        size="small" // Make it smaller
        required
        error={errors.content} // Show error if content is empty
        helperText={errors.content ? "Content is required" : ""}
        InputProps={{
          style: {
            color: "white",
            backgroundColor: "#333",
            borderRadius: 8,
          },
        }}
        InputLabelProps={{ style: { color: "white" } }}
      />

      {/* Category Dropdown */}
      <TextField
        select
        fullWidth
        name="categoryId"
        label="Category"
        value={form.categoryId}
        onChange={handleChange}
        margin="dense"
        variant="filled"
        size="small"  // Make it smaller
        required
        error={errors.categoryId} // Show error if category is not selected
        helperText={errors.categoryId ? "Category is required" : ""}
        InputProps={{
          style: { color: "white", backgroundColor: "#333", borderRadius: 8 },
        }}
        InputLabelProps={{ style: { color: "white" } }}
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Icon Buttons for photo, GIF, and YouTube */}
      <Box mt={1} display="flex" gap={1} alignItems="center" justifyContent="space-between">
        <Box display="flex" gap={1} alignItems="center">
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="upload-photo"
            type="file"
            name="photo"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-photo">
            <IconButton component="span" size="small">
              <PhotoCamera sx={{ color: "white" }} />
            </IconButton>
          </label>

          <IconButton onClick={() => setGifModalOpen(true)} size="small">
            <Gif sx={{ color: "white" }} />
          </IconButton>

          {/* YouTube Icon Button */}
          <IconButton onClick={handleYouTubeClick} size="small">
            <YouTube sx={{ color: "white" }} />
          </IconButton>
        </Box>

        {/* Post Button */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            borderRadius: "20px", // Slight rounding for the button
            width: "120px", // Set a fixed width for consistency
            minWidth: "auto",
            padding: "6px 16px", // Adjust padding to make it look neat
            fontSize: "1rem",
            backgroundColor: "#1976D2",  // Blue background color
            color: "white",  // White text color
            "&:hover": {
              backgroundColor: "#1565C0",  // Darker blue on hover
            },
          }}
        >
          Post
        </Button>
      </Box>

      {/* GIF Preview */}
      {form.gifUrl && (
        <Box mt={1}>
          <img
            src={form.gifUrl}
            alt="Selected GIF"
            width="100%"
            style={{ borderRadius: 8 }}
          />
        </Box>
      )}

      {/* YouTube URL input styled inline */}
      {youtubeUrlInput && (
        <Box mt={1} display="flex" gap={1} alignItems="center">
          <TextField
            fullWidth
            name="youtubeUrlInput"
            value={youtubeUrlInput}
            onChange={handleYoutubeUrlChange}
            margin="dense"
            variant="filled"
            size="small"
            placeholder="Enter YouTube URL"
            InputProps={{
              style: {
                color: "white",
                backgroundColor: "#333",
                borderRadius: 8,
              },
            }}
            InputLabelProps={{ style: { color: "white" } }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleYoutubeUrlSubmit}
            sx={{
              backgroundColor: "#1976D2",
              color: "white",
              borderRadius: 8,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: "#1565C0",
              },
            }}
          >
            Add
          </Button>
        </Box>
      )}

      {/* Giphy Picker Modal */}
      <GiphyPicker
        open={gifModalOpen}
        onClose={() => setGifModalOpen(false)}
        onSelect={(url) => {
          setForm({ ...form, gifUrl: url });
          setGifModalOpen(false);
        }}
      />
    </Box>
  );
};

export default CreatePostForm;