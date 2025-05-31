import { Typography } from "@mui/material";
import React from "react";


const BioSection = ({ bio }) => (
  <Typography variant="body2" mt={2} color="text.secondary" align="center">
    {bio || "No bio available."}
  </Typography>
);

export default BioSection;