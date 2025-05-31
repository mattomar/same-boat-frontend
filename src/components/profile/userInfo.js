import { Typography } from "@mui/material";
import React from "react";


const UserInfo = ({ firstName, lastName, username, email }) => (
  <>
    <Typography variant="h4" mt={2} align="center">
      {firstName} {lastName} (@{username})
    </Typography>
    <Typography variant="body1" mt={1} align="center">
      {email}
    </Typography>
  </>
);

export default UserInfo;