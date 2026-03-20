import http from "../http";
import { 
  ApiResponse, 
  StorageItem, 
  StorageListResponse, 
  CreateFolderRequest, 
  RenameFolderRequest 
} from "./models";

export const storageSdk = {
  /**
   * GET /api/v1/storage/public
   * Bisa diakses tanpa token (public).
   * @param parentId ID folder parent (opsional, jika kosong = root)
   */
  getPublicList: async (parentId?: string) => {
    const params = parentId ? { parent_id: parentId } : {};
    const res = await http.get<ApiResponse<StorageListResponse>>("/storage/public", { params });
    return res.data;
  },

  /**
   * GET /api/v1/storage/private
   * Harus pakai token (private).
   */
  getPrivateList: async (token: string, parentId?: string) => {
    const params = parentId ? { parent_id: parentId } : {};
    const res = await http.get<ApiResponse<StorageListResponse>>("/storage/private", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  /**
   * POST /api/v1/storage/folders
   * Membuat folder baru (harus pakai token).
   */
  createFolder: async (token: string, payload: CreateFolderRequest) => {
    const res = await http.post<ApiResponse<StorageItem>>("/storage/folders", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  /**
   * PATCH /api/v1/storage/items/:id
   * Mengubah nama item (harus pakai token dan harus pemilik).
   */
  renameItem: async (token: string, id: string, payload: RenameFolderRequest) => {
    const res = await http.patch<ApiResponse<StorageItem>>(`/storage/items/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  /**
   * DELETE /api/v1/storage/items/:id
   * Menghapus item (harus pakai token dan harus pemilik).
   */
  deleteItem: async (token: string, id: string) => {
    // Return dari delete bisa 204 No Content, jadi response bodynya kosong atau error
    const res = await http.delete<ApiResponse<any>>(`/storage/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
