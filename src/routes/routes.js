import HomePage from "../pages/home"
import WaitingRoom from "../pages/waitingRoom";
import ChatRoom from "../pages/chatRoom";
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

];

export default routes;