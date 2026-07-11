import { cn } from "@/lib/utils";
import { getBrandConfig } from "@/services/configuration";

type BrandNameProps = {
  className?: string;
};

export async function BrandName({ className }: BrandNameProps) {
  const brand = await getBrandConfig();

  return (
    <span className={cn("text-foreground font-semibold", className)}>
      {brand.name}
    </span>
  );
}
