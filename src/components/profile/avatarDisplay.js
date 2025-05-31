import { Avatar, Box } from "@mui/material";
import React from "react";


const AvatarDisplay = ({ avatarUrl, alt }) => {
  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Avatar
        src={avatarUrl || ""}
        alt={alt}
        sx={{ width: 120, height: 120 }}
      />
    </Box>
  );
};

export default AvatarDisplay;