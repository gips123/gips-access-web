import { StorageHeader } from "@/components/storage/storage-header";
import { StorageList } from "@/components/storage/storage-list";
import { StorageCardGrid } from "@/components/storage/storage-card-grid";
import { getPublicQuickListAction, getPublicStorageListAction } from "@/app/(protected)/storage/core/actions";
import { StorageItem } from "@/lib/sdk/models";
import { Image as ImageIcon, Video, FileText } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PublicStoragePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const folderId = typeof searchParams.folder === "string" ? searchParams.folder : undefined;
  const kind = typeof searchParams.kind === "string" ? searchParams.kind : undefined;

  const res =
    kind && ["image", "video", "document"].includes(kind)
      ? await getPublicQuickListAction(kind, folderId)
      : await getPublicStorageListAction(folderId);
  let initialData: StorageItem[] = [];
  if (res?.success && "data" in res && (res as any).data?.items) {
    initialData = (res as any).data.items || [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-6xl px-6 py-12 mx-auto">
        <StorageHeader 
          title="Penyimpanan Publik" 
          description="Akses berkas dan dokumen publik yang dibagikan kepada Anda."
          hideActions={true}
        />
        
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "image", label: "Images", icon: ImageIcon },
            { key: "video", label: "Videos", icon: Video },
            { key: "document", label: "Documents", icon: FileText },
          ].map((c) => {
            const href = `/public-feature/public-storage?${folderId ? `folder=${folderId}&` : ""}kind=${c.key}`;
            const isActive = kind === c.key;
            const Icon = c.icon;
            return (
              <a
                key={c.key}
                href={href}
                className={`px-4 py-3 rounded-2xl border text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 border-blue-500/50 text-white"
                    : "bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.label}
              </a>
            );
          })}
          {kind ? (
            <a
              href={folderId ? `/public-feature/public-storage?folder=${folderId}` : "/public-feature/public-storage"}
              className="px-4 py-2 rounded-lg border text-sm bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/5"
            >
              All
            </a>
          ) : null}
        </div>

        <div>
          {kind ? (
            <StorageCardGrid initialFiles={initialData} readOnly={true} />
          ) : (
            <StorageList initialFiles={initialData} readOnly={true} />
          )}
        </div>
      </main>
    </div>
  );
}
