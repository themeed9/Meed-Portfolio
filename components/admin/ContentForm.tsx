"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

interface ContentEntry {
  id: string;
  key: string;
  value: any;
}

export default function ContentForm({ entry }: { entry: ContentEntry }) {
  const router = useRouter();
  const [value, setValue] = useState(JSON.stringify(entry.value, null, 2));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsed = JSON.parse(value);
      const res = await fetch(`/api/content/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: parsed }),
      });
      if (res.ok) router.refresh();
    } catch (e) {
      alert("Invalid JSON format");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{entry.key.replace(/-/g, " ")}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Key: {entry.key}</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>Save</Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        className="font-mono text-xs"
      />
    </div>
  );
}
