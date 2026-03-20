import { StorageHeader } from "@/components/storage/storage-header";
import { StorageList } from "@/components/storage/storage-list";

// Simulate fetching data from a database or API
async function getStorageData() {
  // Artificial delay to simulate network request (optional)
  // await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: "1", name: "Documents", type: "folder", size: "-", date: "2026-03-18", iconType: "folder" },
    { id: "2", name: "Design_Assets", type: "folder", size: "-", date: "2026-03-19", iconType: "folder" },
    { id: "3", name: "Project_Proposal_v2.pdf", type: "file", size: "2.4 MB", date: "2026-03-20", iconType: "pdf" },
    { id: "4", name: "Q1_Financial_Report.xlsx", type: "file", size: "1.8 MB", date: "2026-03-15", iconType: "spreadsheet" },
    { id: "5", name: "Hero_Image_Final.png", type: "file", size: "4.2 MB", date: "2026-03-10", iconType: "image" },
  ];
}

export default async function StoragePage() {
  const initialData = await getStorageData();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-6xl px-6 py-12 mx-auto">
        <StorageHeader />
        
        <div className="mt-8">
          {/* We pass the data to a Client Component to handle interactivity like sorting, selecting, and context menus */}
          <StorageList initialFiles={initialData} />
        </div>
      </main>
    </div>
  );
}
