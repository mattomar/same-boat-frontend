import HomePage from "../pages/home"
import WaitingRoom from "../pages/waitingRoom";
import React from "react";

const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/waiting-room',
    element: <WaitingRoom />
  }
  // Add more routes here if needed
];

export default routes;