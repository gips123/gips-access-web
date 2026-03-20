"use client";

import { useState } from "react";
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  MoreVertical,
  Download,
  Trash2,
  Share2
} from "lucide-react";

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  iconType: string;
};

interface StorageListProps {
  initialFiles: FileItem[];
  readOnly?: boolean;
}

export function StorageList({ initialFiles, readOnly = false }: StorageListProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
      default:
        return <FileText className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Table Header */}
      <div className="hidden grid-cols-12 gap-4 px-6 py-4 text-xs font-medium tracking-wider text-neutral-500 uppercase border-b border-white/[0.05] bg-white/[0.01] sm:grid">
        <div className="col-span-6 md:col-span-5">Nama Berkas</div>
        <div className="hidden md:block col-span-3">Terakhir Diubah</div>
        <div className="col-span-4 md:col-span-2">Ukuran</div>
        <div className="col-span-2 text-right">Aksi</div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-white/[0.05]">
        {files.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500">
            Tidak ada berkas di folder ini.
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id}
              className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.04] transition-colors cursor-pointer relative"
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
                    {file.date} &bull; {file.size}
                  </span>
                </div>
              </div>

              <div className="hidden md:block col-span-3 text-sm text-neutral-400">
                {file.date}
              </div>

              <div className="hidden sm:block col-span-4 md:col-span-2 text-sm text-neutral-400">
                {file.size}
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
                  {activeMenuId === file.id && (
                    <div className="absolute right-0 z-20 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4 mr-3" /> Unduh
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Share2 className="w-4 h-4 mr-3" /> Bagikan
                      </button>
                      {!readOnly && (
                        <>
                          <div className="h-px bg-white/10 my-1"></div>
                          <button className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4 mr-3" /> Hapus
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
    </div>
  );
}
