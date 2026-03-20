import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { HomeHeader } from "./components/home-header";
import { HomeFeatures } from "./components/home-features";
import { HomeNavbar } from "./components/home-navbar";

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_token")?.value;

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[50%] translate-x-[-50%] w-[40%] h-[30%] rounded-[100%] bg-pink-900/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <HomeNavbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 mx-auto max-w-6xl">
        <HomeHeader />

        <HomeFeatures isLoggedIn={isLoggedIn} />

        {/* Footer info */}
        <div className="mt-28 flex items-center gap-2 text-sm text-neutral-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Aman dan Terenkripsi &copy; {new Date().getFullYear()}</span>
        </div>
      </main>
    </div>
  );
}
