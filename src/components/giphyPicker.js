import React, { useState } from "react";
import {
  Box,
  Modal,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardMedia,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { searchGifs } from "../utils/api";

const GiphyPicker = ({ open, onClose, onSelect }) => {
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState([]);

  const handleGifSearch = async () => {
    try {
      const gifs = await searchGifs(gifSearch);
      setGifResults(gifs);
    } catch (err) {
      console.error("Giphy search error:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        bgcolor="#222"
        p={3}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 3,
          width: "80%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box display="flex" gap={1} mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search GIFs"
            value={gifSearch}
            onChange={(e) => setGifSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleGifSearch}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
              style: { backgroundColor: "white" },
            }}
          />
        </Box>

        <Grid container spacing={2}>
          {gifResults.map((gif) => (
            <Grid item xs={4} key={gif.id}>
              <Card onClick={() => {
                onSelect(gif.images.fixed_height.url);
                setGifSearch("");  // reset state
                setGifResults([]); // clear results
              }}>
                <CardMedia
                  component="img"
                  image={gif.images.fixed_height.url}
                  alt="GIF"
                  sx={{ borderRadius: 1, cursor: "pointer" }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
};

export default GiphyPicker;