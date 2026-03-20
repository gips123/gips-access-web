"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Globe, Lock } from "lucide-react";
import { StorageItem } from "@/lib/sdk/models";

type VisibilityChange = { id: string; isPublic: boolean };

interface StorageVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StorageItem[];
  onSave: (changes: VisibilityChange[]) => Promise<void>;
}

export function StorageVisibilityModal({
  isOpen,
  onClose,
  items,
  onSave,
}: StorageVisibilityModalProps) {
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, boolean> = {};
    for (const it of items) next[it.id] = Boolean(it.is_public);
    setDraft(next);
    setErrorMsg("");
  }, [isOpen, items]);

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

  const previewChanges = useMemo(() => {
    return items
      .map((it) => ({
        id: it.id,
        isPublic: Boolean(draft[it.id]),
        original: Boolean(it.is_public),
      }))
      .filter((x) => x.isPublic !== x.original);
  }, [items, draft]);

  const handleSave = async () => {
    if (previewChanges.length === 0) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");
      await onSave(
        previewChanges.map((c) => ({ id: c.id, isPublic: c.isPublic }))
      );
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan perubahan";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white">Public visibility</h3>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Toggle public/private untuk isi folder saat ini.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close visibility modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                <Globe className="w-4 h-4" /> Public
                <span className="text-neutral-600">|</span>
                <Lock className="w-4 h-4" /> Private
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="py-10 text-center text-neutral-500 text-sm">
                    Folder kosong.
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-neutral-200 truncate">{it.name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {it.type} • {it.size || "-"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400">
                          {draft[it.id] ? "Public" : "Private"}
                        </span>
                        <label className="relative inline-flex h-6 w-11 cursor-pointer select-none items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={Boolean(draft[it.id])}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                [it.id]: e.target.checked,
                              }))
                            }
                          />
                          <span className="pointer-events-none block h-6 w-11 rounded-full bg-white/15 ring-1 ring-white/10 transition-colors peer-checked:bg-blue-600/70" />
                          <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white/80 transition-transform peer-checked:translate-x-5" />
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {errorMsg && (
                <div className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

