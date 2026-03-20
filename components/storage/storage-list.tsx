"use client";

import { useState } from "react";
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Video
} from "lucide-react";
import { StorageItem } from "@/lib/sdk/models";
import { useRouter } from "next/navigation";
import { ShareLinkModal } from "./share-link-modal";
import { FilePreviewModal } from "./file-preview-modal";
import { createPublicShareAction, createShareAction, setItemPublicAction } from "@/app/(protected)/storage/core/actions";

interface StorageListProps {
  initialFiles: StorageItem[];
  readOnly?: boolean;
  onRenameRequest?: (item: StorageItem) => void;
  onDeleteRequest?: (item: StorageItem) => void;
}

export function StorageList({ 
  initialFiles, 
  readOnly = false,
  onRenameRequest,
  onDeleteRequest
}: StorageListProps) {
  const router = useRouter();

  const shortenShareUrlForDisplay = (shareUrl: string) => {
    // Backend bisa mengembalikan URL panjang (/api/v1/storage/share/<token>)
    // Kita rewrite agar tampilan/QR jadi pendek (/s/<token>).
    return shareUrl.replace(
      /\/api\/v1\/storage\/share\/([A-Za-z0-9\-_]+)/,
      "/s/$1"
    );
  };

  type ShareRes = {
    success: boolean;
    data?: { url: string; expires_at: string };
    error?: string;
  };

  // Use initialFiles directly to sync with Server Actions revalidation
  const files = initialFiles;
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareFileName, setShareFileName] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<StorageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleDownload = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);

    try {
      const shareRes = readOnly
        ? await createPublicShareAction(file.id)
        : await createShareAction(file.id);
      const typedShareRes = shareRes as ShareRes;
      const shareUrl: string | undefined = typedShareRes?.data?.url;
      if (!typedShareRes.success || !shareUrl) {
        throw new Error(typedShareRes.error || "Gagal membuat share link");
      }

      const finalUrl = shortenShareUrlForDisplay(shareUrl);
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
      console.error(e);
      // Fallback: open share url directly if possible
      const msg = e instanceof Error ? e.message : "Gagal download file";
      alert(msg);
    }
  };

  const openShare = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);

    try {
      const shareRes = readOnly
        ? await createPublicShareAction(file.id)
        : await createShareAction(file.id);
      const typedShareRes = shareRes as ShareRes;
      const shareUrl: string | undefined = typedShareRes?.data?.url;
      if (!typedShareRes.success || !shareUrl) {
        throw new Error(typedShareRes.error || "Gagal membuat share link");
      }

      setShareFileName(file.name);
      setShareUrl(shortenShareUrlForDisplay(shareUrl));
      setShareOpen(true);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Gagal membuat share link";
      alert(msg);
    }
  };

  const handleToggleVisibility = async (item: StorageItem) => {
    if (readOnly) return;
    const nextIsPublic = !item.is_public;
    try {
      const res: any = await setItemPublicAction(item.id, nextIsPublic);
      if (!res?.success) {
        throw new Error(res?.error || "Gagal mengubah visibilitas");
      }
      setActiveMenuId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal mengubah visibilitas";
      alert(msg);
    }
  };

  const openPreview = async (file: StorageItem) => {
    if (file.type !== "file") return;
    setActiveMenuId(null);
    setPreviewFile(file);

    try {
      if (readOnly) {
        const shareRes = await createPublicShareAction(file.id);
        if (!shareRes?.success) {
          throw new Error((shareRes as any)?.error || "Gagal membuat share link untuk preview");
        }
        const url = (shareRes as any)?.data?.url as string | undefined;
        setPreviewUrl(url || "");
      } else {
        const shareRes = await createShareAction(file.id);
        if (!shareRes?.success) {
          throw new Error((shareRes as any)?.error || "Gagal membuat share link untuk preview");
        }
        const url = (shareRes as any)?.data?.url as string | undefined;
        setPreviewUrl(url || "");
      }
    } catch (e) {
      console.error(e);
      setPreviewUrl("");
    } finally {
      setPreviewOpen(true);
    }
  };

  const handleItemClick = (file: StorageItem) => {
    if (file.type === "folder") {
      if (readOnly) {
        router.push(`/public-feature/public-storage?folder=${file.id}`);
      } else {
        router.push(`/storage?folder=${file.id}`);
      }
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "folder":
        return <Folder className="w-5 h-5 text-blue-400 fill-blue-400/20" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-red-400" />;
      case "spreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case "video":
        return <Video className="w-5 h-5 text-neutral-200" />;
      default:
        return <FileText className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-xl backdrop-blur-md">
      {/* Table Header */}
      <div className="hidden grid-cols-12 gap-4 px-6 py-4 text-xs font-medium tracking-wider text-neutral-500 uppercase border-b border-white/[0.05] bg-white/[0.01] sm:grid rounded-t-2xl">
        <div className="col-span-6 md:col-span-5">File Name</div>
        <div className="hidden md:block col-span-3">Last Modified</div>
        <div className="col-span-4 md:col-span-2">Size</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-white/[0.05]">
        {files.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500 rounded-b-2xl">
            No files in this folder.
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id}
              onClick={() => handleItemClick(file)}
              className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.04] transition-colors cursor-pointer relative last:rounded-b-2xl"
            >
              <div className="flex items-center gap-3 col-span-10 sm:col-span-6 md:col-span-5">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 group-hover:scale-105 transition-transform shadow-lg shadow-black/20">
                  {getIcon(file.iconType)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-neutral-500 sm:hidden mt-0.5">
                    {new Date(file.updated_at).toLocaleDateString("id-ID")} &bull; {file.size || "-"}
                  </span>
                </div>
              </div>

              <div className="hidden md:block col-span-3 text-sm text-neutral-400">
                {new Date(file.updated_at).toLocaleDateString("id-ID")}
              </div>

              <div className="hidden sm:block col-span-4 md:col-span-2 text-sm text-neutral-400">
                {file.size || "-"}
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === file.id ? null : file.id);
                    }}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === file.id && (file.type === "file" || !readOnly) && (
                    <div className="absolute right-0 z-20 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                      {file.type === "file" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void openPreview(file);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" /> Detail / Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-3" /> Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void openShare(file);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Share2 className="w-4 h-4 mr-3" /> Share
                          </button>
                        </>
                      )}
                      {!readOnly && (
                        <>
                          <div className="h-px bg-white/10 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              void handleToggleVisibility(file);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            {file.is_public ? "Make Private" : "Make Public"}
                          </button>
                          <div className="h-px bg-white/10 my-1"></div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); if(onRenameRequest) onRenameRequest(file); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" /> Rename
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); if(onDeleteRequest) onDeleteRequest(file); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-3" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}
