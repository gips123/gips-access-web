import axios from "axios";

// Base config untuk panggil backend Golang
// FE selalu memanggil path seperti "/auth/login" atau "/storage/...".
// Jadi baseURL harus mencakup "/api/v1". Kita normalisasi agar aman di semua env.
const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const normalizedBaseURL = rawBaseURL.endsWith("/api/v1")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, "")}/api/v1`;

const http = axios.create({
  baseURL: normalizedBaseURL,
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
