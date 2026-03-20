// ─── STANDARD API RESPONSE ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── AUTH MODELS ─────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: User;
}

// ─── STORAGE MODELS ──────────────────────────────────────────────────
export interface StorageItem {
  id: string;
  name: string;
  type: "file" | "folder";
  iconType: string;
  size: string;
  size_bytes?: number;
  mime_type?: string;
  owner_id?: string;
  is_public: boolean;
  parent_id?: string; // kosong jika di root
  updated_at: string;
  created_at: string;
}

export interface StorageListResponse {
  items: StorageItem[];
  total: number;
  parent_id?: string;
}

export interface CreateFolderRequest {
  name: string;
  is_public: boolean;
  parent_id?: string;
}

export interface RenameFolderRequest {
  name: string;
}
