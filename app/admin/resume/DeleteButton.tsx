"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const res = await fetch(`/api/resume-experiences/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-error transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
    >
      <Trash2 size={14} />
    </button>
  );
}
