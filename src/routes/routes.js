import HomePage from "../pages/home"
import WaitingRoom from "../pages/waitingRoom";
import Login from "../pages/logIn"
import ChatRoom from "../pages/chatRoom";
import Signup from "../pages/signUp";
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
];

export default routes;