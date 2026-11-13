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

import Grid from "@mui/material/Grid";

import AvatarDisplay from "../components/profile/avatarDisplay";
import UserInfo from "../components/profile/userInfo";
import BioSection from "../components/profile/bioSection";
import Header from "../components/header";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/postCard";
import FriendButton from "../components/friendButton";
import MessageButton from "../components/messageButton";
import BlockButton from "../components/blockButton";

import { fetchCategories, checkBlockStatus } from "../utils/api";

const Profile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const currentUserId = localStorage.getItem("userId");
  const isOwnProfile = Number(currentUserId) === Number(userId);

  const [friendStatus, setFriendStatus] = useState("none");
  const [requestId, setRequestId] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  const [blockStatusLoading, setBlockStatusLoading] = useState(!isOwnProfile);
  const [blockStatusError, setBlockStatusError] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Profile data
  const userProfile = useSelector((state) => state.user.profiles[userId]);

  const { loading: profileLoading, error: profileError } = useSelector(
    (state) => state.user,
  );

  // Posts
  const posts = useSelector((state) => state.posts.posts);
  const postsLoading = useSelector((state) => state.posts.loading);
  const postsError = useSelector((state) => state.posts.error);

  // Check block relationship before fetching another user's profile
  useEffect(() => {
    let cancelled = false;

    const loadBlockStatus = async () => {
      if (isOwnProfile) {
        setIsBlocked(false);
        setBlockStatusError(false);
        setBlockStatusLoading(false);
        return;
      }

      try {
        setBlockStatusLoading(true);
        setBlockStatusError(false);
        setIsBlocked(false);

        const data = await checkBlockStatus(userId);

        if (cancelled) return;

        const blocked =
          Boolean(data.blockedByMe) ||
          Boolean(data.blockedMe) ||
          Boolean(data.isBlocked);

        setIsBlocked(blocked);
      } catch (err) {
        if (!cancelled) {
          console.error("Error checking block status:", err);
          setBlockStatusError(true);
        }
      } finally {
        if (!cancelled) {
          setBlockStatusLoading(false);
        }
      }
    };

    loadBlockStatus();

    return () => {
      cancelled = true;
    };
  }, [userId, isOwnProfile]);

  // Only fetch profile if the block check allows access
  useEffect(() => {
    if (
      userId &&
      !blockStatusLoading &&
      !blockStatusError &&
      !isBlocked &&
      !userProfile
    ) {
      dispatch(fetchUserProfile(userId));
    }
  }, [
    dispatch,
    userId,
    userProfile,
    blockStatusLoading,
    blockStatusError,
    isBlocked,
  ]);

  // Only fetch posts if the block check allows access
  useEffect(() => {
    if (userId && !blockStatusLoading && !blockStatusError && !isBlocked) {
      dispatch(fetchPostsByUser(userId));
    }
  }, [dispatch, userId, blockStatusLoading, blockStatusError, isBlocked]);

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

        if (!res.ok) {
          throw new Error("Could not fetch friend status");
        }

        const data = await res.json();

        setFriendStatus(data.status);
        setRequestId(data.requestId);
      } catch (err) {
        console.error("Error loading friend status:", err);
      }
    };

    if (userProfile?.id && !isOwnProfile && !isBlocked && !blockStatusLoading) {
      loadStatus();
    }
  }, [userProfile?.id, isOwnProfile, isBlocked, blockStatusLoading]);

  // Show loading while checking whether the profile is accessible
  if (blockStatusLoading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  // If the block check fails, don't reveal the profile
  if (blockStatusError) {
    return (
      <>
        <Header />
        <Typography color="error" align="center" mt={5}>
          Could not load this profile.
        </Typography>
      </>
    );
  }

  // Treat blocked profiles as nonexistent
  if (isBlocked) {
    return (
      <>
        <Header />
        <Box textAlign="center" mt={10}>
          <Typography variant="h5" color="white" fontWeight="bold">
            User not found
          </Typography>
          <Typography color="gray" mt={1}>
            This profile is unavailable.
          </Typography>
        </Box>
      </>
    );
  }

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

            {!isOwnProfile && (
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

                <BlockButton
                  userId={userProfile.id}
                  onBlockStatusChange={(blocked) => {
                    setIsBlocked(blocked);
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#555", mb: 3 }} />

        {/* Posts Section */}
        <Box mt={4}>
          {isOwnProfile && (
            <>
              <Typography variant="h6" color="white" mb={3} textAlign="center">
                Create Post
              </Typography>

              <CreatePostForm categories={categoryList} userId={userId} />
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
