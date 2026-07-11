import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export function ContentContainer({
  children,
  className,
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "px-page mx-auto w-full max-w-[var(--spacing-content)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
