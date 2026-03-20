import { StorageHeader } from "@/components/storage/storage-header";
import { StorageList } from "@/components/storage/storage-list";

// Simulate fetching public data
async function getPublicStorageData() {
  return [
    { id: "1", name: "Public Documents", type: "folder", size: "-", date: "2026-03-18", iconType: "folder" },
    { id: "2", name: "Public_Assets", type: "folder", size: "-", date: "2026-03-19", iconType: "folder" },
    { id: "3", name: "Public_Brochure.pdf", type: "file", size: "1.2 MB", date: "2026-03-20", iconType: "pdf" },
  ];
}

export default async function PublicStoragePage() {
  const initialData = await getPublicStorageData();

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
        
        <div className="mt-8">
          <StorageList initialFiles={initialData} readOnly={true} />
        </div>
      </main>
    </div>
  );
}
