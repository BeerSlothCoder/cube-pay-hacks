import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = false,
  onClick,
}: CardProps) {
  const baseClasses =
    "bg-dark-card border border-cube-green/20 rounded-lg p-6 shadow-lg";
  const hoverClasses = hover
    ? "hover:border-cube-green/40 hover:shadow-xl hover:shadow-cube-green/10 transition-all duration-200 cursor-pointer"
    : "";

  return (
    <div className={cn(baseClasses, hoverClasses, className)} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}
