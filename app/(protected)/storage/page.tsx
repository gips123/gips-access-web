import { getPrivateStorageListAction } from "./core/actions";
import { StorageItem } from "@/lib/sdk/models";
import { redirect } from "next/navigation";
import { StorageClientWrapper } from "@/components/storage/storage-client-wrapper";

export default async function StoragePage() {
  const res = await getPrivateStorageListAction();
  
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

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-6xl px-6 py-12 mx-auto">
        <StorageClientWrapper initialFiles={initialData} />
      </main>
    </div>
  );
}
