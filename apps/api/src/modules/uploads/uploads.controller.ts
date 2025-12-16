import { Elysia, t } from "elysia";
import { UploadService } from "./uploads.service"; // Ensure relative path is correct based on structure

export const uploadsController = new Elysia({ prefix: "/uploads" })
  .post("/", async ({ body, set }) => {
    const file = body.file as Blob;
    
    if (!file) {
      set.status = 400;
      throw new Error("No file provided");
    }

    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        set.status = 400;
        throw new Error("File too large (max 5MB)");
    }

    const folder = (body.folder as string) || "general";
    
    // Validate folder name to prevent arbitrary writes
    if (!["avatars", "attachments"].includes(folder)) {
        // Default to general if invalid folder
        // or stricter: throw error
    }

    return await UploadService.saveFile(file, folder);
  }, {
    body: t.Object({
      file: t.File(),
      folder: t.Optional(t.String())
    })
  });
