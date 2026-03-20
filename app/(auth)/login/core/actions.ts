'use server'

import { cookies } from 'next/headers'
import { authSdk, LoginPayload } from '@/lib/sdk/auth'
import { redirect } from 'next/navigation'

export async function loginAction(payload: LoginPayload) {
  try {
    const response = await authSdk.login(payload);
    
    // Gagal login
    if (!response.success || !response.data) {
      return { success: false, error: response.error || "Login failed" };
    }

    // Login Sukses, kita simpan tokennya di Cookie Next.js
    const cookieStore = await cookies()
    cookieStore.set('auth_token', response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 minggu
      path: '/',
      sameSite: 'lax',
    })

    return { success: true };
  } catch (error: any) {
    // Tangkap error misal HTTP 401 dan ambil body error dari backend
    const errorMsg = error.response?.data?.error || error.message;
    return { success: false, error: errorMsg };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (token) {
       // Panggil endpoint backend secara opsional jika perlu track status online dsb
       await authSdk.logout(token).catch(() => {});
    }
  } finally {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
  }
}
