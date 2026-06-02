interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant bg-surface ${
        hover ? "hover:shadow-2 hover:border-outline transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
