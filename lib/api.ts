import axios from "axios";

// Create an axios instance with default config
export const api = axios.create({
  baseURL: "http://localhost:5001", // Default client server
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Error Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Function to change the base URL (useful for switching nodes)
export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};
