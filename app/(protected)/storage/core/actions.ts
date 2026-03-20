'use server'

import { cookies } from 'next/headers'
import { storageSdk } from '@/lib/sdk/storage'
import { CreateFolderRequest, RenameFolderRequest } from '@/lib/sdk/models'
import { revalidatePath } from 'next/cache'

// Helper fungsi untuk mengambil auth_token dari cookies secara dinamis
async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) throw new Error("Unauthorized: Please log in first");
  return token;
}

export async function getPrivateStorageListAction(parentId?: string) {
  try {
    const token = await getToken();
    const res = await storageSdk.getPrivateList(token, parentId);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function getPublicStorageListAction(parentId?: string) {
  try {
    // Ingat bahwa public route di backend Go tidak memerlukan token
    const res = await storageSdk.getPublicList(parentId);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function getPrivateQuickListAction(kind: string, parentId?: string) {
  try {
    const token = await getToken();
    const res = await storageSdk.getPrivateQuickList(token, kind, parentId);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function getPublicQuickListAction(kind: string, parentId?: string) {
  try {
    const res = await storageSdk.getPublicQuickList(kind, parentId);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function createFolderAction(payload: CreateFolderRequest) {
  try {
    const token = await getToken();
    const res = await storageSdk.createFolder(token, payload);
    
    // Auto-refresh tampilan halaman storage tanpa perlu request lagi dari client
    if (res.success) {
      revalidatePath('/storage'); 
    }
    
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function uploadFileAction(formData: FormData) {
  try {
    const token = await getToken();
    const res = await storageSdk.uploadFile(token, formData);
    if (res.success) {
      revalidatePath('/storage');
    }
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function renameItemAction(id: string, payload: RenameFolderRequest) {
  try {
    const token = await getToken();
    const res = await storageSdk.renameItem(token, id, payload);
    if (res.success) {
      revalidatePath('/storage');
    }
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function deleteItemAction(id: string) {
  try {
    const token = await getToken();
    await storageSdk.deleteItem(token, id);
    
    // Perbarui otomatis data halaman setelah terhapus
    revalidatePath('/storage');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function createShareAction(id: string) {
  try {
    const token = await getToken();
    const res = await storageSdk.createShare(token, id);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function createPublicShareAction(id: string) {
  try {
    const res = await storageSdk.createPublicShare(id);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function getFolderPathAction(folderId?: string) {
  try {
    if (!folderId) return { success: true, data: [] as any[] };
    const token = await getToken();
    const res = await storageSdk.getPrivateFolderPath(token, folderId);
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

export async function setItemPublicAction(id: string, isPublic: boolean) {
  try {
    const token = await getToken();
    const res = await storageSdk.setItemPublic(token, id, isPublic);
    if (res?.success) {
      revalidatePath('/storage');
      revalidatePath('/public-feature/public-storage');
    }
    return res;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}
