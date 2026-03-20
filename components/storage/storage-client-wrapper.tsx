"use client";

import { useState } from "react";
import { StorageHeader } from "./storage-header";
import { StorageList } from "./storage-list";
import { StorageItem } from "@/lib/sdk/models";
import { createFolderAction, renameItemAction, deleteItemAction, uploadFileAction } from "@/app/(protected)/storage/core/actions";
import { X, FolderPlus, Upload, FileText, Check, AlertTriangle } from "lucide-react";

interface StorageClientWrapperProps {
  initialFiles: StorageItem[];
  parentId?: string;
}

export function StorageClientWrapper({ initialFiles, parentId }: StorageClientWrapperProps) {
  const [files, setFiles] = useState<StorageItem[]>(initialFiles);
  
  // Modal states
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [renameItem, setRenameItem] = useState<StorageItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<StorageItem | null>(null);

  // Form states
  const [folderName, setFolderName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await createFolderAction({
      name: folderName,
      is_public: false,
      parent_id: parentId,
    });

    setIsSubmitting(false);
    if (res?.success) {
      setFolderModalOpen(false);
      setFolderName("");
    } else {
      setErrorMsg(res?.error || "Gagal membuat folder");
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameItem || !renameName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await renameItemAction(renameItem.id, { name: renameName });

    setIsSubmitting(false);
    if (res?.success) {
      setRenameItem(null);
      setRenameName("");
    } else {
      setErrorMsg(res?.error || "Gagal mengubah nama");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await deleteItemAction(deleteItem.id);

    setIsSubmitting(false);
    if (res?.success) {
      setDeleteItem(null);
    } else {
      setErrorMsg(res?.error || "Gagal menghapus item");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setErrorMsg("Pilih file terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("is_public", "false");
    if (parentId) {
      formData.append("parent_id", parentId);
    }

    const res = await uploadFileAction(formData);

    setIsSubmitting(false);
    if (res?.success) {
      setUploadModalOpen(false);
      setUploadFile(null);
    } else {
      setErrorMsg(res?.error || "Gagal mengupload file ke MinIO");
    }
  };

  return (
    <>
      <div onClick={() => {
        // Wrap header for custom add action
        const btnNew = document.getElementById("btn-new-folder");
        const btnUp = document.getElementById("btn-upload");
      }}>
        {/* We need to modify StorageHeader to accept onClick handlers or handle it via DOM events for now, or better yet, pass props */}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between w-full mb-8">
        <div className="flex flex-col gap-3">
            <a href="/home" className="inline-flex items-center w-fit text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Dashboard
            </a>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  Private Storage
                  {parentId && (
                    <a href="/storage" className="text-sm font-normal text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-full transition-colors inline-block mt-1">
                       / Go to Root
                    </a>
                  )}
                </h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setFolderModalOpen(true)} className="flex items-center justify-center h-10 px-4 text-sm font-medium text-black bg-white rounded-lg hover:bg-neutral-200 transition-all shadow-lg">
                <FolderPlus className="w-4 h-4 mr-2" /> New Folder
            </button>
            <button onClick={() => setUploadModalOpen(true)} className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-lg">
                <Upload className="w-4 h-4 mr-2" /> Upload
            </button>
        </div>
      </div>

      <StorageList 
        initialFiles={initialFiles} 
        onRenameRequest={(item) => {
          setRenameItem(item);
          setRenameName(item.name);
        }}
        onDeleteRequest={(item) => setDeleteItem(item)}
      />

      {/* MODAL: Create Folder */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">New Folder</h3>
              <button onClick={() => setFolderModalOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <input 
                type="text" 
                value={folderName} 
                onChange={e => setFolderName(e.target.value)}
                placeholder="Folder name" 
                className="w-full text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
              <button disabled={isSubmitting || !folderName} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-all">
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload File */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Upload File</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="w-full relative border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-400 mb-4 hover:border-blue-500/50 transition-colors cursor-pointer overflow-hidden bg-white/[0.02]">
                 <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                 />
                 <Upload className="w-8 h-8 mb-2 text-neutral-500" />
                 <span className="text-sm text-center">
                    {uploadFile ? uploadFile.name : "Click to select file or drag & drop"}
                 </span>
              </div>
              {errorMsg && <p className="text-amber-400 text-sm mb-4 text-center">{errorMsg}</p>}
              <button disabled={isSubmitting || !uploadFile} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-all">
                {isSubmitting ? "Uploading..." : "Upload File"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Rename */}
      {renameItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Rename Item</h3>
              <button onClick={() => setRenameItem(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleRename}>
              <input 
                type="text" 
                value={renameName} 
                onChange={e => setRenameName(e.target.value)}
                className="w-full text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
              <button disabled={isSubmitting || !renameName} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-all">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirm */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
               <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Delete Validation</h3>
            <p className="text-sm text-neutral-400 mb-6">Are you sure you want to delete <b>{deleteItem.name}</b>? This action cannot be undone.</p>
            
            {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
            
            <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteItem(null)} disabled={isSubmitting} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 font-medium transition-all">
                    Cancel
                </button>
                <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-all">
                    {isSubmitting ? "Deleting..." : "Delete"}
                </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
