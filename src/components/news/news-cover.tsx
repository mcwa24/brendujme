import Image from "next/image";

interface NewsCoverProps {
  title: string;
  imageLabel: string;
  imageUrl?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function NewsCover({
  title,
  imageLabel,
  imageUrl,
  className = "flex aspect-[16/9] items-center justify-center bg-accent/90",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: NewsCoverProps) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="font-display px-4 text-center text-lg text-white/90 md:text-2xl">
        {imageLabel}
      </span>
    </div>
  );
}
