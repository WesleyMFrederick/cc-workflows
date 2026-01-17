import { google } from "googleapis";
import * as fs from "node:fs";
import * as path from "node:path";
import type { GDriveDownloadFileInput, InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_download_file",
  description:
    "Download a file from Google Drive to a local path. Streams directly to disk - no base64 encoding in context.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "Google Drive file ID to download",
      },
      destPath: {
        type: "string",
        description: "Absolute path where the file should be saved",
      },
    },
    required: ["fileId", "destPath"],
  },
} as const;

const drive = google.drive("v3");

export async function downloadFile(
  args: GDriveDownloadFileInput,
): Promise<InternalToolResponse> {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(args.destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Get file metadata first
    const metadata = await drive.files.get({
      fileId: args.fileId,
      fields: "name,mimeType,size",
    });

    // Download file as stream
    const response = await drive.files.get(
      {
        fileId: args.fileId,
        alt: "media",
      },
      { responseType: "stream" },
    );

    // Pipe to destination file
    const dest = fs.createWriteStream(args.destPath);

    await new Promise<void>((resolve, reject) => {
      response.data
        .on("error", reject)
        .pipe(dest)
        .on("error", reject)
        .on("finish", resolve);
    });

    // Get actual file size after download
    const stats = fs.statSync(args.destPath);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              destPath: args.destPath,
              fileName: metadata.data.name,
              mimeType: metadata.data.mimeType,
              size: stats.size,
            },
            null,
            2,
          ),
        },
      ],
      isError: false,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Failed to download file: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
