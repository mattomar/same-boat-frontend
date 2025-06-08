import HomePage from "../pages/home"
import WaitingRoom from "../pages/waitingRoom";
import Login from "../pages/logIn"
import ChatRoom from "../pages/chatRoom";
import Signup from "../pages/signUp";
import Profile from "../pages/profile";
import CategoryTabs from "../pages/community"
import PostWithAllComments from "../pages/postWithAllComments";
import { SocketProvider } from '../context/SocketContext';
import React from "react";

const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/waiting-room',
    element: (
      <SocketProvider>
        <WaitingRoom />
      </SocketProvider>
    ),
  },
  {
    path: '/chat/:room',
    element: (
      <SocketProvider>
        <ChatRoom />
      </SocketProvider>
    ),

  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
  },
  {
    path: "/community",
    element: <CategoryTabs />,
  },
  {
    path: "/post/:postId/comments",
    element: <PostWithAllComments />
  }

];

export default routes;