// src/components/ImageDisplay.tsx
import Image from "next/image";

export function ImageDisplay({ url }: { url: string }) {
  return (
    <div>
      <Image
        src={url}
        alt="Uploaded image"
        width={500}
        height={500}
        className="rounded-lg"
      />
      <a href={url} target="_blank" rel="noopener noreferrer">
        View Original
      </a>
    </div>
  );
}
