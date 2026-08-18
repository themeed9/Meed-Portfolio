"use client";

import { useState, useRef } from "react";
import { FileText, CheckCircle, X } from "lucide-react";

export default function ResumeUpload({ currentUrl }: { currentUrl: string | null }) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted");
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const saveRes = await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadData.url, version: "1.0" }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);

      setUrl(uploadData.url);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: "", version: "1.0" }),
      });
      setUrl(null);
    } catch {
      setError("Failed to remove resume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {url ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-subtle border border-primary-base/20">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
            <FileText size={20} className="text-text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-600" />
              Resume uploaded
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-accent hover:underline truncate block"
            >
              {url}
            </a>
          </div>
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="p-1.5 text-text-tertiary hover:text-error transition-colors disabled:opacity-50"
            aria-label="Remove resume"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="block w-full text-sm text-text-tertiary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-text-accent hover:file:bg-primary-subtle/80 file:cursor-pointer cursor-pointer"
          />
          {uploading && <span className="text-sm text-text-tertiary">Uploading...</span>}
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
