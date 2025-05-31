// src/app/api/uploadthing/[...uploadthing]/route.ts
import { createRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
  
  // Optional custom config
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
  },

  // Add custom error handling
  onError: (error: Error) => {
    console.error("UploadThing Error:", error);
    
    if (error instanceof UploadThingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "BAD_REQUEST" ? 400 : 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  },

  // Middleware to add additional security headers
  middleware: (req) => {
    const headers = new Headers();
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return { headers };
  }
});

// Add DELETE endpoint for file management
export async function DELETE(request: Request) {
  const { fileKeys } = await request.json();
  
  if (!fileKeys || !Array.isArray(fileKeys)) {
    return NextResponse.json(
      { error: "Missing fileKeys array" },
      { status: 400 }
    );
  }

  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(fileKeys);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
}
