import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/landal-logo.svg"
        alt="Landal Holiday breaks in nature"
        width={238}
        height={98}
        className={compact ? "h-10 w-auto" : "h-16 w-auto"}
        priority
      />
    </div>
  );
}
