import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/userSlice";
import { fetchPostsByUser } from "../store/postSlice";
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
import Grid from "@mui/material/Grid";
import PostCard from "../components/postCard";
import FriendButton from "../components/friendButton";
import MessageButton from "../components/messageButton";

const Profile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const [friendStatus, setFriendStatus] = useState("none");
  const [requestId, setRequestId] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  const currentUserId = localStorage.getItem("userId");

  // Profile data
  const userProfile = useSelector((state) => state.user.profiles[userId]);

  const { loading: profileLoading, error: profileError } = useSelector(
    (state) => state.user,
  );

  // Posts now come from the shared posts Redux state
  const posts = useSelector((state) => state.posts.posts);
  const postsLoading = useSelector((state) => state.posts.loading);
  const postsError = useSelector((state) => state.posts.error);

  // Fetch profile information
  useEffect(() => {
    if (userId && !userProfile) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId, userProfile]);

  // Fetch posts belonging to this profile
  useEffect(() => {
    if (userId) {
      dispatch(fetchPostsByUser(userId));
    }
  }, [dispatch, userId]);

  // Fetch categories
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

  // Fetch friend status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3079/api/friends/status/${userProfile.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        setFriendStatus(data.status);
        setRequestId(data.requestId);
      } catch (err) {
        console.error("Error loading friend status:", err);
      }
    };

    if (userProfile?.id) {
      loadStatus();
    }
  }, [userProfile?.id]);

  // Profile loading
  if (profileLoading || !userProfile) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (profileError) {
    return (
      <>
        <Header />
        <Typography color="error" variant="h6" align="center" mt={4}>
          {profileError}
        </Typography>
      </>
    );
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
        {/* Profile Header */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
          mb={4}
        >
          <AvatarDisplay
            avatarUrl={userProfile.profile?.avatarUrl || undefined}
            alt={`${userProfile.firstName} ${userProfile.lastName}`}
          />

          <Box textAlign="center" sx={{ color: "white" }}>
            <UserInfo
              firstName={userProfile.firstName}
              lastName={userProfile.lastName}
              username={userProfile.username}
              email={userProfile.email}
            />

            <BioSection
              sx={{ color: "white" }}
              bio={userProfile.profile?.bio || "No bio available"}
            />

            {Number(currentUserId) !== Number(userProfile.id) && (
              <Box
                mt={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
              >
                <FriendButton
                  userId={userProfile.id}
                  requestId={requestId}
                  initialStatus={friendStatus}
                />

                <MessageButton userId={userProfile.id} />
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#555", mb: 3 }} />

        {/* Posts Section */}
        <Box mt={4}>
          {Number(currentUserId) === Number(userProfile.id) && (
            <>
              <Typography variant="h6" color="white" mb={3} textAlign="center">
                Create Post
              </Typography>
              <CreatePostForm categories={categoryList} userId={userId} />{" "}
            </>
          )}

          <Typography
            variant="h6"
            color="white"
            mb={3}
            mt={3}
            textAlign="center"
          >
            Posts
          </Typography>

          {postsLoading ? (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress />
            </Box>
          ) : postsError ? (
            <Typography color="error" textAlign="center">
              {postsError}
            </Typography>
          ) : posts.length > 0 ? (
            <Grid container spacing={2}>
              {posts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="gray" textAlign="center">
              No posts yet.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Profile;
