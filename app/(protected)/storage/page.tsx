import { getFolderPathAction, getPrivateQuickListAction, getPrivateStorageListAction } from "./core/actions";
import { StorageItem } from "@/lib/sdk/models";
import { redirect } from "next/navigation";
import { StorageClientWrapper } from "@/components/storage/storage-client-wrapper";
import { Image as ImageIcon, Video, FileText } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StoragePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const folderId = typeof searchParams.folder === 'string' ? searchParams.folder : undefined;
  const kind = typeof searchParams.kind === 'string' ? searchParams.kind : undefined;

  const res =
    kind && ["image", "video", "document"].includes(kind)
      ? await getPrivateQuickListAction(kind, folderId)
      : await getPrivateStorageListAction(folderId);
  const folderPathRes = await getFolderPathAction(folderId);
  
  if (res && res.success === false) {
    const isUnauthorized = res.error?.toLowerCase().includes("token") || res.error?.toLowerCase().includes("unauthorized") || res.error?.toLowerCase().includes("login");
    if (isUnauthorized) {
       redirect('/login?clear=1');
    }
  }
  
  let initialData: StorageItem[] = [];
  if (res && 'data' in res && res.data) {
    initialData = res.data.items || [];
  }

  let folderPath: StorageItem[] = [];
  if (folderPathRes && 'data' in folderPathRes && folderPathRes.data) {
    folderPath = folderPathRes.data || [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-6xl px-6 py-12 mx-auto">
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "image", label: "Images", icon: ImageIcon },
            { key: "video", label: "Videos", icon: Video },
            { key: "document", label: "Documents", icon: FileText },
          ].map((c) => {
            const href = `/storage?${folderId ? `folder=${folderId}&` : ""}kind=${c.key}`;
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
              href={folderId ? `/storage?folder=${folderId}` : "/storage"}
              className="px-4 py-2 rounded-lg border text-sm bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/5"
            >
              All
            </a>
          ) : null}
        </div>

        <StorageClientWrapper
          initialFiles={initialData}
          parentId={folderId}
          folderPath={folderPath}
          viewMode={kind ? "cards" : "table"}
        />
      </main>
    </div>
  );
}
