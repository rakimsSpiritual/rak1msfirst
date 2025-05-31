import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Delete old avatar if exists
        if (metadata.user.avatarUrl) {
          const oldFileKey = metadata.user.avatarUrl.split(
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
          )[1];
          
          await new (await import("uploadthing/server")).UTApi().deleteFiles(oldFileKey);
        }

        // Update user avatar in database
        const updatedUser = await prisma.user.update({
          where: { id: metadata.user.id },
          data: { avatarUrl: file.url },
        });

        // Update Stream chat avatar
        await streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: { image: file.url },
        });

        return { avatarUrl: file.url };
      } catch (error) {
        console.error("Avatar upload failed:", error);
        throw new UploadThingError("Failed to update avatar");
      }
    }),

  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 }, // Added PDF support
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id }; // Include userId in metadata
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const media = await prisma.media.create({
          data: {
            url: file.url,
            type: file.type.startsWith("image") 
              ? "IMAGE" 
              : file.type.startsWith("video") 
                ? "VIDEO" 
                : "FILE",
            userId: metadata.userId,
          },
        });

        return { 
          mediaId: media.id,
          url: file.url,
          type: media.type 
        };
      } catch (error) {
        console.error("Attachment upload failed:", error);
        throw new UploadThingError("Failed to save attachment");
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
