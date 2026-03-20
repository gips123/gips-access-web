import { cookies } from "next/headers";
import { HomeNavbarClient } from "./home-navbar-client";

export async function HomeNavbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_token")?.value;

  return <HomeNavbarClient isLoggedIn={isLoggedIn} />;
}
