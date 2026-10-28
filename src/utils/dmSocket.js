import { io } from "socket.io-client";

const API_URL = "http://localhost:3079";

// One shared, JWT-authenticated connection to the "/dm" namespace.
// Random chat keeps using SocketProvider on the default namespace, untouched.
let socket = null;
let socketToken = null;

export const getDmSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  if (socket && socketToken !== token) disconnectDmSocket();
  if (!socket) {
    socket = io(`${API_URL}/dm`, { auth: { token } });
    socketToken = token;
  }
  return socket;
};

export const disconnectDmSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
};
