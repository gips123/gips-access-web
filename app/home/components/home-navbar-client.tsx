"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User, Shield } from "lucide-react";
import { logoutAction } from "@/app/(auth)/login/core/actions";

interface HomeNavbarClientProps {
  isLoggedIn: boolean;
}

export function HomeNavbarClient({ isLoggedIn }: HomeNavbarClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logoutAction();
    router.refresh();
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-black/50 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2.5 group">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-900/40 ring-1 ring-white/10">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-white">Ghifary Web</span>
      </Link>

      {/* Auth Actions */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            {/* Logged In Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <User className="w-3.5 h-3.5" />
              Logged In
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Guest Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-neutral-500">
              Guest
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
