// src/components/ImageUpload.tsx
"use client";

import { useUploadThing } from "@/utils/uploadthing";
import { useState } from "react";

export function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("imageUploader");

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button
        onClick={async () => {
          const res = await startUpload(files);
          console.log("Upload result:", res);
        }}
      >
        Upload
      </button>
    </div>
  );
}
