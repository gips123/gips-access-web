"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Share2,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StorageItem } from "@/lib/sdk/models";
import { FilePreviewModal } from "./file-preview-modal";
import { ShareLinkModal } from "./share-link-modal";
import { createPublicShareAction, createShareAction } from "@/app/(protected)/storage/core/actions";
import { setItemPublicAction } from "@/app/(protected)/storage/core/actions";

type ShareRes = {
  success: boolean;
  data?: { url: string; expires_at: string };
  error?: string;
};

interface StorageCardGridProps {
  initialFiles: StorageItem[];
  readOnly: boolean;
  onRenameRequest?: (item: StorageItem) => void;
  onDeleteRequest?: (item: StorageItem) => void;
}

function shortenShareUrlForDisplay(shareUrl: string) {
  return shareUrl.replace(/\/api\/v1\/storage\/share\/([A-Za-z0-9\-_]+)/, "/s/$1");
}

export function StorageCardGrid({
  initialFiles,
  readOnly,
  onRenameRequest,
  onDeleteRequest,
}: StorageCardGridProps) {
  const router = useRouter();
  const files = initialFiles;

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareFileName, setShareFileName] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<StorageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function prefetchThumbUrls() {
      const mediaItems = files
        .filter((f) => f.type === "file")
        .filter((f) => {
          const mime = f.mime_type || "";
          const iconType = f.iconType || "";
          return (
            mime.startsWith("image/") ||
            mime.startsWith("video/") ||
            iconType === "image" ||
            iconType === "video"
          );
        })
        .slice(0, 24);

      const next: Record<string, string> = {};

      for (const it of mediaItems) {
        try {
          const res: ShareRes = readOnly
            ? await createPublicShareAction(it.id)
            : await createShareAction(it.id);
          const url = res?.data?.url;
          if (res?.success && url) next[it.id] = url;
        } catch {
          // ignore
        }
        if (cancelled) return;
      }

      if (!cancelled) setThumbUrls(next);
    }

    prefetchThumbUrls();
    return () => {
      cancelled = true;
    };
  }, [readOnly, files]);

  const handleDownload = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);

    try {
      const shareRes: ShareRes = readOnly
        ? (await createPublicShareAction(file.id))
        : (await createShareAction(file.id));
      const url = shareRes?.data?.url;
      if (!shareRes?.success || !url) {
        throw new Error(shareRes?.error || "Gagal membuat share link");
      }

      const finalUrl = shortenShareUrlForDisplay(url);
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal download file";
      alert(msg);
    }
  };

  const openShare = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);

    try {
      const shareRes: ShareRes = readOnly
        ? (await createPublicShareAction(file.id))
        : (await createShareAction(file.id));
      const url = shareRes?.data?.url;
      if (!shareRes?.success || !url) {
        throw new Error(shareRes?.error || "Gagal membuat share link");
      }

      setShareFileName(file.name);
      setShareUrl(shortenShareUrlForDisplay(url));
      setShareOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal membuat share link";
      alert(msg);
    }
  };

  const openPreview = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);
    setPreviewFile(file);

    try {
      const shareRes: ShareRes = readOnly
        ? await createPublicShareAction(file.id)
        : await createShareAction(file.id);

      if (!shareRes?.success || !shareRes?.data?.url) {
        setPreviewUrl("");
      } else {
        // Use BE share URL directly as inline preview (no MinIO).
        setPreviewUrl(shareRes.data.url);
      }
    } catch {
      setPreviewUrl("");
    } finally {
      setPreviewOpen(true);
    }
  };

  const handleToggleVisibility = async (item: StorageItem) => {
    if (readOnly) return;
    const nextIsPublic = !item.is_public;
    try {
      const res = await setItemPublicAction(item.id, nextIsPublic);
      if (!res?.success) {
        throw new Error(res?.error || "Gagal mengubah visibilitas");
      }
      setActiveMenuId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal mengubah visibilitas";
      alert(msg);
    }
  };

  const getThumb = (file: StorageItem) => {
    const mime = file.mime_type || "";
    const iconType = file.iconType || "";
    const isImage = mime.startsWith("image/") || iconType === "image";
    const isVideo = mime.startsWith("video/") || iconType === "video";

    const thumbUrl = thumbUrls[file.id];

    if (isImage && thumbUrl) {
      return (
        <img
          src={thumbUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded-xl border border-white/10 bg-black/20"
          draggable={false}
        />
      );
    }
    if (isVideo && thumbUrl) {
      return (
        <video
          src={thumbUrl}
          muted
          preload="metadata"
          className="w-full h-full object-cover rounded-xl border border-white/10 bg-black/20"
        />
      );
    }

    if (iconType === "image") {
      return <ImageIcon className="w-10 h-10 text-purple-400" />;
    }
    if (iconType === "video") {
      return <Video className="w-10 h-10 text-neutral-200" />;
    }
    return <FileText className="w-10 h-10 text-neutral-400" />;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 hover:border-white/20 transition-colors cursor-pointer"
            onClick={() => openPreview(file)}
          >
            <div className="relative w-full h-40 flex items-center justify-center bg-white/[0.03] rounded-xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 opacity-80 pointer-events-none bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                {getThumb(file)}
              </div>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-200 truncate">{file.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {file.size || "-"}
                </div>
              </div>

              <div className="relative">
                <button
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === file.id ? null : file.id);
                  }}
                  aria-label="File actions"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {activeMenuId === file.id && (
                  <div className="absolute right-0 z-20 mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 transform origin-top-right animate-in fade-in">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                        void openPreview(file);
                      }}
                    >
                      Detail / Preview
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDownload(file);
                      }}
                    >
                      <Download className="w-4 h-4 mr-3" /> Download
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        void openShare(file);
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-3" /> Share
                    </button>

                    {!readOnly && (
                      <>
                        <div className="h-px bg-white/10 my-1"></div>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleToggleVisibility(file);
                          }}
                        >
                          {file.is_public ? "Make Private" : "Make Public"}
                        </button>

                        {onRenameRequest && (
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onRenameRequest(file);
                            }}
                          >
                            Rename
                          </button>
                        )}
                        {onDeleteRequest && (
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onDeleteRequest(file);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-3" /> Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ShareLinkModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        fileName={shareFileName}
        url={shareUrl}
      />

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
          setPreviewUrl("");
        }}
        file={previewFile}
        previewUrl={previewUrl}
        onDownload={handleDownload}
        onOpenShare={(f) => openShare(f)}
      />
    </>
  );
}

