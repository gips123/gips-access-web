"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, X } from "lucide-react";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  url: string;
}

export function ShareLinkModal({ isOpen, onClose, fileName, url }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background page scroll while modal is open.
    const prevPaddingRight = document.body.style.paddingRight;
    const wasOverflowHidden = document.body.classList.contains("overflow-hidden");

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add("overflow-hidden");
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (!wasOverflowHidden) document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback: try selecting text
      const el = document.getElementById("share-url-input") as HTMLInputElement | null;
      el?.select?.();
      document.execCommand?.("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const qrSrc = useMemo(() => {
    const data = encodeURIComponent(url);
    // Lightweight QR generator (renders as an <img> so no extra JS deps).
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${data}`;
  }, [url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Share link</h3>
                <p className="text-sm text-neutral-400 mt-0.5 break-words">
                  {fileName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close share modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <label className="text-xs text-neutral-500 uppercase tracking-wider">
                Link
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  id="share-url-input"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
                  readOnly
                  value={url}
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-200"
                  aria-label="Copy share link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-3 text-sm text-neutral-400">
                {copied ? "Link copied!" : "Copy link to share/download this file."}
              </p>

              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  QR Code
                </div>
                <div className="mt-5 flex items-center justify-center border border-white bg-white w-fit mx-auto rounded-xl p-2">
                  <img
                    src={qrSrc}
                    alt={`QR code for ${fileName}`}
                    className="w-60 h-60 rounded-xl bg-white/[0.03] border border-white/10"
                    draggable={false}
                  />
                </div>
                <div className="mt-3 text-center text-sm text-neutral-400">
                  Scan QR untuk buka link di HP.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

