import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BenefitCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function BenefitCard({
  icon,
  title,
  description,
  className,
}: BenefitCardProps) {
  return (
    <article
      className={cn(
        "bg-card text-card-foreground shadow-card rounded-lg border p-[var(--card-padding)]",
        className,
      )}
    >
      <div className="bg-accent text-accent-foreground mb-5 inline-flex size-11 items-center justify-center rounded-md">
        {icon}
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        {description}
      </p>
    </article>
  );
}
