import axios from "axios";

// Base config untuk panggil backend Golang
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor untuk handle response secara global jika dibutuhkan
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Biarkan caller (action) yang menentukan cara handle error-nya
    return Promise.reject(error);
  }
);

export default http;
