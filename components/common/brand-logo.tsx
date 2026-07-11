import Image from "next/image";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandConfig } from "@/services/configuration";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
};

export async function BrandLogo({ className, markClassName }: BrandLogoProps) {
  const brand = await getBrandConfig();

  if (brand.logo) {
    return (
      <Image
        alt={`Logo ${brand.name}`}
        className={cn("size-10 rounded-lg object-contain", className)}
        height={40}
        priority
        src={brand.logo}
        width={40}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-primary text-primary-foreground inline-flex size-10 items-center justify-center rounded-lg",
        markClassName,
        className,
      )}
    >
      <Scale className="size-5" />
    </span>
  );
}
