import { google } from "googleapis";
import * as fs from "node:fs";
import * as path from "node:path";
import type { GDriveUploadFileInput, InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_upload_file",
  description:
    "Upload a file to Google Drive from a local file path. Streams file directly - no base64 encoding needed.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Absolute path to the local file to upload",
      },
      fileName: {
        type: "string",
        description: "Optional: Name for the uploaded file (defaults to original filename)",
      },
      mimeType: {
        type: "string",
        description: "Optional: MIME type (auto-detected if not provided)",
      },
      folderId: {
        type: "string",
        description: "Optional: Google Drive folder ID to upload to",
      },
    },
    required: ["filePath"],
  },
} as const;

const drive = google.drive("v3");

export async function uploadFile(
  args: GDriveUploadFileInput,
): Promise<InternalToolResponse> {
  try {
    // Validate file exists
    if (!fs.existsSync(args.filePath)) {
      return {
        content: [{ type: "text", text: `File not found: ${args.filePath}` }],
        isError: true,
      };
    }

    // Use provided fileName or extract from path
    const uploadFileName = args.fileName || path.basename(args.filePath);
    const stream = fs.createReadStream(args.filePath);

    const requestBody: { name: string; parents?: string[] } = {
      name: uploadFileName,
    };

    if (args.folderId) {
      requestBody.parents = [args.folderId];
    }

    const response = await drive.files.create({
      requestBody,
      media: {
        mimeType: args.mimeType,
        body: stream,
      },
      fields: "id,name,webViewLink",
    });

    const { id, name, webViewLink } = response.data;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              fileId: id,
              fileName: name,
              webViewLink: webViewLink,
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
          text: `Failed to upload file: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
