import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TrustCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function TrustCard({
  icon,
  title,
  description,
  className,
}: TrustCardProps) {
  return (
    <article
      className={cn(
        "bg-card/80 shadow-soft rounded-lg border p-[var(--card-padding)]",
        className,
      )}
    >
      <div className="text-secondary mb-4">{icon}</div>
      <h3 className="text-foreground font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {description}
      </p>
    </article>
  );
}
