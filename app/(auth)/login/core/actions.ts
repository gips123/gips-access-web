'use server'

import { cookies } from 'next/headers'

export async function dummyLogin() {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', 'dummy-token-123', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function dummyLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
