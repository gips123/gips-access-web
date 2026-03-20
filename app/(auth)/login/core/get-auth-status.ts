"use server";

import { cookies } from "next/headers";

export async function getAuthStatus(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("auth_token")?.value;
}
