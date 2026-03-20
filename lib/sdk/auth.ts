import http from "../http";
import { ApiResponse, LoginResponse, User } from "./models";

// Parameter untuk fungsi yang dikirim dari action/frontend
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authSdk = {
  /**
   * Register user baru
   */
  register: async (payload: RegisterPayload) => {
    const res = await http.post<ApiResponse<User>>("/auth/register", payload);
    return res.data;
  },

  /**
   * Login session — mendapatkan token dan info user
   */
  login: async (payload: LoginPayload) => {
    const res = await http.post<ApiResponse<LoginResponse>>("/auth/login", payload);
    return res.data;
  },

  /**
   * Mengambil info profil user yang sedang login menggunakan token Bearer
   */
  getMe: async (token: string) => {
    const res = await http.get<ApiResponse<{ email: string; role: string; user_id: string }>>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  /**
   * Logout session untuk menghapus (atau invalidate token di server backend kalau ada logicnya)
   */
  logout: async (token: string) => {
    const res = await http.post<ApiResponse<any>>(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },
};
