"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Globe, Lock, X, ArrowRight, ShieldAlert, LogIn } from "lucide-react";

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export function StorageModal({ isOpen, onClose, isLoggedIn }: StorageModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLoginPrompt) setShowLoginPrompt(false);
        else onClose();
      }
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, showLoginPrompt]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset inner state when modal closes
  useEffect(() => {
    if (!isOpen) setShowLoginPrompt(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) { setShowLoginPrompt(false); onClose(); } }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* ─── MAIN VIEW: Choose Storage ─── */}
          {!showLoginPrompt ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Pilih Penyimpanan</h2>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    Pilih jenis akses penyimpanan yang Anda butuhkan.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="px-6 pb-6 flex flex-col gap-3">
                {/* Public Storage — always accessible */}
                <Link
                  href="/public-feature/public-storage"
                  onClick={onClose}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-black/40 ring-1 ring-white/10">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                      Public Storage
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Akses berkas publik tanpa login.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </Link>

                {/* Private Storage — conditionally navigates or shows login prompt */}
                {isLoggedIn ? (
                  <Link
                    href="/storage"
                    onClick={onClose}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-black/40 ring-1 ring-white/10">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                        Private Storage
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Berkas pribadi — Anda sudah login.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-amber-500/30 transition-all duration-300 text-left w-full"
                  >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-600 shadow-lg shadow-black/40 ring-1 ring-white/10">
                      <Lock className="w-6 h-6 text-neutral-300" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                        Private Storage
                      </p>
                      <p className="text-xs text-amber-500/80 mt-0.5">
                        Memerlukan login untuk mengakses.
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ─── LOGIN PROMPT VIEW ─── */
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  Kembali
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Prompt Content */}
              <div className="px-6 pb-8 flex flex-col items-center text-center gap-4">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 ring-1 ring-amber-500/10">
                  <ShieldAlert className="w-8 h-8 text-amber-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Login Diperlukan</h3>
                  <p className="text-sm text-neutral-400 max-w-xs">
                    Private Storage hanya dapat diakses oleh pengguna yang sudah login ke sistem.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2 w-full mt-2">
                  <Link
                    href="/login?from=/storage"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full h-11 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/30"
                  >
                    <LogIn className="w-4 h-4" />
                    Masuk ke Akun
                  </Link>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex items-center justify-center w-full h-11 px-4 text-sm font-medium text-neutral-400 hover:text-white bg-white/[0.03] border border-white/[0.07] rounded-xl hover:bg-white/[0.07] transition-all"
                  >
                    Kembali ke Pilihan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
