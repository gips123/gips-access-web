"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Image as ImageIcon, Share2, X, Video } from "lucide-react";
import { StorageItem } from "@/lib/sdk/models";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: StorageItem | null;
  previewUrl?: string;
  onDownload: (file: StorageItem) => Promise<void> | void;
  onOpenShare: (file: StorageItem) => Promise<void> | void;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  previewUrl,
  onDownload,
  onOpenShare,
}: FilePreviewModalProps) {
  const [textPreview, setTextPreview] = useState<string>("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTextPreview("");
      setTextLoading(false);
      setTextError(null);
    }
  }, [isOpen]);

  // Important: FE only uses BE-tunneled URLs for preview (no direct MinIO).
  const fileUrl = previewUrl || "";
  const fileName = file?.name || "";
  const mimeType = file?.mime_type || "";
  const iconType = file?.iconType || "";
  const ext = useMemo(() => {
    const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
    return m?.[1] || "";
  }, [fileName]);

  const isImage = useMemo(() => {
    return (
      mimeType.startsWith("image/") ||
      iconType === "image" ||
      ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)
    );
  }, [mimeType, iconType, ext]);

  const isPdf = useMemo(() => {
    return mimeType.includes("pdf") || iconType === "pdf" || ext === "pdf";
  }, [mimeType, iconType, ext]);

  const isVideo = useMemo(() => {
    if (mimeType.startsWith("video/")) return true;
    if (iconType === "video") return true;
    return ["mp4", "webm", "ogg", "mov", "mkv"].includes(ext);
  }, [mimeType, iconType, ext]);

  const isTextLike = useMemo(() => {
    if (mimeType.startsWith("text/")) return true;
    if (["csv", "txt", "md", "json", "xml"].includes(ext)) return true;
    if (mimeType.includes("csv")) return true;
    return false;
  }, [mimeType, ext]);

  useEffect(() => {
    if (!isOpen) return;
    if (!file || !fileUrl) return;
    if (!isTextLike) return;

    const controller = new AbortController();
    const run = async () => {
      setTextLoading(true);
      setTextError(null);
      try {
        const res = await fetch(fileUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTextPreview(await res.text());
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Gagal menampilkan preview teks";
        setTextError(msg);
      } finally {
        setTextLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [isOpen, file, fileUrl, isTextLike]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background page scroll while modal is open.
    const prevPaddingRight = document.body.style.paddingRight;
    const wasOverflowHidden = document.body.classList.contains("overflow-hidden");

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add("overflow-hidden");
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      if (!wasOverflowHidden) document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  const isEmbeddableDoc = Boolean(fileUrl) && ["document", "spreadsheet", "archive", "other"].includes(iconType);
  const canPreview = Boolean(fileUrl) && (isImage || isPdf || isVideo || isTextLike || isEmbeddableDoc);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10">
                    {isImage ? (
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    ) : isPdf ? (
                      <FileText className="w-5 h-5 text-red-400" />
                    ) : isVideo ? (
                      <Video className="w-5 h-5 text-neutral-200" />
                    ) : isTextLike ? (
                      <FileText className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-neutral-400" />
                    )}
                  </span>
                  <h3 className="text-lg font-semibold text-white truncate">{fileName}</h3>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {mimeType ? mimeType : "unknown mime type"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDownload(file)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={async () => {
                    await onOpenShare(file);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 rounded-lg text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close preview modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6">
              {canPreview ? (
                <>
                  {isImage && (
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="w-full max-h-[70vh] object-contain rounded-xl border border-white/10 bg-black/20"
                    />
                  )}

                  {isPdf && (
                    <iframe
                      src={fileUrl}
                      className="w-full h-[70vh] rounded-xl border border-white/10 bg-black/20"
                      title={`Preview ${fileName}`}
                    />
                  )}

                  {isVideo && (
                    <video
                      src={fileUrl}
                      controls
                      className="w-full max-h-[70vh] rounded-xl border border-white/10 bg-black/20"
                    />
                  )}

                  {isTextLike && (
                    <div className="mt-2">
                      {textLoading ? (
                        <div className="text-neutral-400 text-sm py-10 text-center">
                          Loading preview...
                        </div>
                      ) : textError ? (
                        <div className="text-amber-400 text-sm py-10 text-center">
                          {textError}
                          <div className="mt-2 text-neutral-500">
                            Silakan gunakan tombol <b>Download</b>.
                          </div>
                        </div>
                      ) : (
                        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-neutral-200">
                          {textPreview || "Empty file"}
                        </pre>
                      )}
                    </div>
                  )}

                  {isEmbeddableDoc &&
                    !isImage &&
                    !isPdf &&
                    !isVideo &&
                    !isTextLike && (
                      <iframe
                        src={fileUrl}
                        className="w-full h-[70vh] rounded-xl border border-white/10 bg-black/20"
                        title={`Preview ${fileName}`}
                      />
                    )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-neutral-100 font-medium">
                    Preview tidak tersedia.
                  </div>
                  <div className="text-neutral-500 text-sm mt-2">
                    Browser bisa jadi tidak mendukung tipe ini (atau CORS membatasi akses). Gunakan tombol{" "}
                    <b>Download</b>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

