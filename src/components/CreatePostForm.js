import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  createPost,
  fetchPostsByCategory,
  fetchPostsByUser,
} from "../store/postSlice";
import { PhotoCamera, Gif, YouTube } from "@mui/icons-material";
import GiphyPicker from "../components/giphyPicker";

const CreatePostForm = ({ categories, userId }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    content: "",
    categoryId: "",
    photo: null,
    gifUrl: "",
    youtubeUrl: "",
  });

  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");

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

    const newErrors = {
      content: !form.content,
      categoryId: !form.categoryId,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      return;
    }

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

    try {
      const result = await dispatch(createPost(formData)).unwrap();

      // Refresh the correct posts list depending on where the form is used
      if (userId) {
        await dispatch(fetchPostsByUser(userId));
      } else {
        await dispatch(fetchPostsByCategory(finalForm.categoryId));
      }

      console.log("✅ Post created:", result);

      setForm({
        content: "",
        categoryId: "",
        photo: null,
        gifUrl: "",
        youtubeUrl: "",
      });

      setYoutubeUrlInput("");
    } catch (error) {
      console.error("❌ Failed to create post:", error);
    }
  };

  const handleYouTubeClick = () => {
    setYoutubeUrlInput("");
  };

  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrlInput(e.target.value);
  };

  const handleYoutubeUrlSubmit = () => {
    setForm({ ...form, youtubeUrl: youtubeUrlInput });
    setYoutubeUrlInput("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      p={2}
      borderRadius={3}
      maxWidth="500px"
      m="0 auto"
      display="flex"
      flexDirection="column"
      gap={2}
    >
      {/* Content Text Field */}
      <TextField
        fullWidth
        placeholder="What's on your mind?"
        name="content"
        multiline
        rows={2}
        value={form.content}
        onChange={handleChange}
        margin="dense"
        variant="filled"
        size="small"
        required
        error={errors.content}
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
        size="small"
        required
        error={errors.categoryId}
        helperText={errors.categoryId ? "Category is required" : ""}
        InputProps={{
          style: {
            color: "white",
            backgroundColor: "#333",
            borderRadius: 8,
          },
        }}
        InputLabelProps={{ style: { color: "white" } }}
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Photo, GIF, and YouTube Buttons */}
      <Box
        mt={1}
        display="flex"
        gap={1}
        alignItems="center"
        justifyContent="space-between"
      >
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

          <IconButton onClick={handleYouTubeClick} size="small">
            <YouTube sx={{ color: "white" }} />
          </IconButton>
        </Box>

        {/* Post Button */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            borderRadius: "20px",
            width: "120px",
            minWidth: "auto",
            padding: "6px 16px",
            fontSize: "1rem",
            backgroundColor: "#1976D2",
            color: "white",
            "&:hover": {
              backgroundColor: "#1565C0",
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

      {/* YouTube URL Input */}
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

      {/* Giphy Picker */}
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
