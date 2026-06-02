"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export default function AdminHeader({ title, description, backHref, action }: AdminHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
