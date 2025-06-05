import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Box,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import AvatarDisplay from "../components/profile/avatarDisplay";
import UserInfo from "../components/profile/userInfo";
import BioSection from "../components/profile/bioSection";
import Header from "../components/header";
import CreatePostForm from "../components/CreatePostForm";
import { fetchCategories } from "../utils/api";

const Profile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const [categoryList, setCategoryList] = useState([]);

  const theme = useTheme();

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategoryList(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
  
    loadCategories();
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <Typography color="error" variant="h6" align="center" mt={4}>
          {error}
        </Typography>
      </>
    );

  if (!profile)
    return (
      <>
        <Header />
        <Typography variant="h6" align="center" mt={4} color="white">
          No profile found
        </Typography>
      </>
    );

  return (
    <>
      <Header />

      <Box
        maxWidth="900px"
        mx="auto"
        mt={4}
        px={2}
        py={3}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 4,
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Profile Header Section */}
        <Box display="flex" alignItems="center" gap={4} mb={3}>
          <AvatarDisplay
            avatarUrl={profile.profile.avatarUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
          />
          <Box>
            <UserInfo
              firstName={profile.firstName}
              lastName={profile.lastName}
              username={profile.username}
              email={profile.email}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#555", mb: 2 }} />

        {/* Bio */}
        <BioSection bio={profile.profile.bio} />

        {/* Placeholder for future posts */}
        <Box mt={4}>
          <Typography variant="h6" color="white" mb={2}>
            Posts
          </Typography>
          <Typography variant="body2" color="gray">
            No posts yet — coming soon!
          </Typography>
        </Box>
      </Box>
      <CreatePostForm categories={categoryList} />

    </>
  );
};

export default Profile;
