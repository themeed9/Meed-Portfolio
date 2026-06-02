interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success";
  className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-surface-container-high text-on-surface-variant",
    primary: "bg-primary-98 text-primary-30",
    secondary: "bg-tertiary-98 text-tertiary-30",
    success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
