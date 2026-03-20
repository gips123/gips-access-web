"use client";

import { Upload, Plus, Search, Filter } from "lucide-react";

interface StorageHeaderProps {
  title?: string;
  description?: string;
  hideActions?: boolean;
}

export function StorageHeader({ 
  title = "Penyimpanan Data", 
  description = "Kelola berkas, dokumen, dan aset desain Anda.",
  hideActions = false
}: StorageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-sm text-neutral-400">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative group flex-1 sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Cari berkas..."
            className="w-full h-10 pl-10 pr-4 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Action Buttons */}
        {!hideActions && (
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center h-10 px-3 text-sm font-medium text-neutral-300 bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            
            <button className="flex items-center justify-center h-10 px-4 text-sm font-medium text-black bg-white rounded-lg hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Plus className="w-4 h-4 mr-2" />
              Folder Baru
            </button>

            <button className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Upload className="w-4 h-4 mr-2" />
              Unggah
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
