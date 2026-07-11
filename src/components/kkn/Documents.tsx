import React, { useState } from "react";
import { FolderOpen, Upload, File as FileIcon, Download, Trash2 } from "lucide-react";
import { PremiumEmptyState } from "../PremiumEmptyState";

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  date: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "1", name: "Proposal_KKN_063.pdf", size: "2.4 MB", date: "2024-07-20" },
    { id: "2", name: "SK_Rektor_Penerjunan.pdf", size: "1.1 MB", date: "2024-07-22" },
  ]);

  const handleUpload = () => {
    // Simulate upload
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          date: new Date().toISOString().split("T")[0],
        };
        setDocuments([newDoc, ...documents]);
      }
    };
    input.click();
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Digital Repository</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and store official KKN documents safely.</p>
        </div>
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all text-sm uppercase tracking-wide"
        >
          <Upload size={16} />
          Upload File
        </button>
      </div>

      <div className="bg-[#0c101b] border border-white/10 rounded-2xl overflow-hidden">
        {documents.length === 0 ? (
          <PremiumEmptyState
            icon={FolderOpen}
            title="No Documents Found"
            description="Upload your first document to start building your digital repository."
            actionLabel="Upload Document"
            onAction={handleUpload}
          />
        ) : (
          <div className="divide-y divide-white/5">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base break-all">{doc.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 font-mono">{doc.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-xs text-slate-500 font-mono">{doc.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button className="p-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
