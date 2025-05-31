import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { useParams } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import AvatarDisplay from "../components/profile/avatarDisplay";
import UserInfo from "../components/profile/userInfo";
import BioSection from "../components/profile/bioSection";

const Profile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  if (loading) return <CircularProgress />;
  if (error)
    return (
      <Typography color="error" variant="h6" align="center" mt={4}>
        {error}
      </Typography>
    );
  if (!profile) return <Typography variant="h6">No profile found</Typography>;

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={2}>
      <AvatarDisplay
        avatarUrl={profile.profile.avatarUrl}
        alt={`${profile.firstName} ${profile.lastName}`}
      />
      <UserInfo
        firstName={profile.firstName}
        lastName={profile.lastName}
        username={profile.username}
        email={profile.email}
      />
      <BioSection bio={profile.profile.bio} />
    </Box>
  );
};

export default Profile;