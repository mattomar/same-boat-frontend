// ===== APPEND to the bottom of src/utils/api.js (uses its existing axios + API_URL) =====

const dmAuth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Always throw an object with a .message (and any extra fields like .code)
const dmError = (error) => {
  const data = error.response && error.response.data;
  if (data && typeof data === "object") throw data;
  throw { message: error.response ? "Request failed. Please try again." : "Network error. Check your connection." };
};

export const getMessageStatus = async (userId) => {
  try {
    return (await axios.get(`${API_URL}/api/messages/status/${userId}`, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const getConversations = async () => {
  try {
    return (await axios.get(`${API_URL}/api/messages/conversations`, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const openConversationWith = async (userId) => {
  try {
    return (await axios.post(`${API_URL}/api/messages/conversations/with/${userId}`, {}, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const getConversationMessages = async (conversationId, params = {}) => {
  try {
    return (await axios.get(`${API_URL}/api/messages/conversations/${conversationId}/messages`, { ...dmAuth(), params })).data;
  } catch (e) { return dmError(e); }
};

export const sendDirectMessage = async (conversationId, text) => {
  try {
    return (await axios.post(`${API_URL}/api/messages/conversations/${conversationId}/messages`, { text }, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const getIncomingMessageRequests = async () => {
  try {
    return (await axios.get(`${API_URL}/api/messages/requests/incoming`, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const getOutgoingMessageRequests = async () => {
  try {
    return (await axios.get(`${API_URL}/api/messages/requests/outgoing`, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const sendMessageRequest = async (receiverId, text) => {
  try {
    return (await axios.post(`${API_URL}/api/messages/requests/send/${receiverId}`, { text }, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const acceptMessageRequest = async (requestId) => {
  try {
    return (await axios.post(`${API_URL}/api/messages/requests/accept/${requestId}`, {}, dmAuth())).data;
  } catch (e) { return dmError(e); }
};

export const declineMessageRequest = async (requestId) => {
  try {
    return (await axios.post(`${API_URL}/api/messages/requests/decline/${requestId}`, {}, dmAuth())).data;
  } catch (e) { return dmError(e); }
};
