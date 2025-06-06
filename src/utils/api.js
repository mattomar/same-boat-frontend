import axios from "axios";

const API_URL = "http://localhost:3079"; // Replace with your backend URL

// Sign up API
export const signUp = async (formData) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await axios.post(
    "http://localhost:3079/api/auth/signup",
    formData,
    config
  );

  return response.data;
};


// Log in API
export const logIn = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    return response.data; // This will contain the token
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Example to get user data (token required)
export const getUserData = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // The user's data
  } catch (error) {
    console.error("Get user data error:", error);
    throw error.response ? error.response.data : error.message;
  }
};


export const startSession = async () => {
    try {
      const response = await fetch(`${API_URL}/user/start-session`, {
        method: 'GET',
        credentials: 'include', // <== important to send/receive cookies
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session start failed:', error);
      return null;
    }
  };

  export const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/categories`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error.response ? error.response.data : error.message;
    }
  };

  export const createPostApi = async (formData) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.post(`${API_URL}/posts/createPost`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Create post error:", error);
      throw error.response ? error.response.data : error.message;
    }
  };

  export const searchGifs = async (query) => {
    const response = await axios.get(`${API_URL}/gifs/search?q=${query}`);
    return response.data;
  };