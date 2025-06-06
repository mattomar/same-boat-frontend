import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Box,
  Typography,
  Divider,
  Container,
} from "@mui/material";
import AvatarDisplay from "../components/profile/avatarDisplay";
import UserInfo from "../components/profile/userInfo";
import BioSection from "../components/profile/bioSection";
import Header from "../components/header";
import CreatePostForm from "../components/CreatePostForm";
import { fetchCategories } from "../utils/api";

const Profile = () => {
  const { userId } = useParams(); // Extract userId from URL
  const dispatch = useDispatch();

  // Access user profile by userId from Redux store
  const userProfile = useSelector((state) => state.user.profiles[userId]);
  const { loading, error } = useSelector((state) => state.user);

  // Log the profile for debugging
  console.log("User Profile Data:", userProfile);  // Should contain profile data once fetched
  
  const [categoryList, setCategoryList] = useState([]);

  // Fetch user profile if it's not available in Redux (initial render)
  useEffect(() => {
    if (userId && !userProfile) { // Prevent unnecessary fetch if profile exists
      console.log("Fetching profile for user:", userId);
      dispatch(fetchUserProfile(userId)); // Dispatch to fetch profile
    }
  }, [dispatch, userId, userProfile]); // Fetch if userProfile is not present

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

  // If profile is still loading or not found, show loading/error state
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

// If profile is undefined after fetching, show fallback UI instead of throwing error
if (!userProfile) {
  return (
    <>
      <Header />
      <Typography color="error" variant="h6" align="center" mt={4}>
        Profile not found. Please try again later.
      </Typography>
    </>
  );
}

  // If profile is undefined after fetching, throw an error
  if (!userProfile) {
    throw new Error(`Profile not found for userId: ${userId}`);
  }

  return (
    <>
      <Header />
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          px: 3,
          py: 4,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 4,
          backdropFilter: "blur(4px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Profile Header Section - Profile Picture, Name, Bio */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={3} mb={4}>
          <AvatarDisplay
            avatarUrl={userProfile.profile?.avatarUrl || undefined} // Access safely
            alt={`${userProfile.firstName} ${userProfile.lastName}`}
          />
          <Box textAlign="center" sx={{ color: "white" }}>
            <UserInfo
              firstName={userProfile.firstName}
              lastName={userProfile.lastName}
              username={userProfile.username}
              email={userProfile.email}
            />
            <BioSection sx={{ color: "white" }} bio={userProfile.profile?.bio || 'No bio available'} />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#555", mb: 3 }} />

        {/* Create Post Form Section */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h6" color="white" mb={2}>
            Create a New Post
          </Typography>
          <CreatePostForm categories={categoryList} />
        </Box>

        {/* Posts Section */}
        <Box mt={4} textAlign="center">
          <Typography variant="h6" color="white" mb={2}>
            Posts
          </Typography>
          <Typography variant="body2" color="gray">
            No posts yet — coming soon!
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Profile;
