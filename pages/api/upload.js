// api/upload.js

import { put } from "@vercel/blob";
import formidable from "formidable";
import fs from "fs";
import { extname } from "path";

// Required to allow formidable to parse form-data (file uploads)
export const config = {
  api: { bodyParser: false },
};

// Generate a unique filename
function generateUniqueFilename(originalFilename) {
  const fileExt = extname(originalFilename);
  const base = originalFilename.replace(fileExt, "");
  const unique = Date.now() + "-" + Math.random().toString(36).substring(2, 9);
  return `${base}-${unique}${fileExt}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable Error:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    // Extract uploaded file
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Read file data from temp storage
      const fileData = fs.readFileSync(file.filepath);
      const finalName = generateUniqueFilename(file.originalFilename);

      // Upload to Vercel Blob
      const blobFile = await put(`product-images/${finalName}`, fileData, {
        access: "public",
        contentType: file.mimetype,
      });

      // Blob returns a public URL (used by frontend)
      return res.status(200).json({
        success: true,
        url: blobFile.url,
      });
    } catch (uploadError) {
      console.error("❌ Blob Upload Failed:", uploadError);

      return res.status(500).json({
        error: "Failed to upload image",
        details: "Check BLOB_READ_WRITE_TOKEN and your Vercel Blob setup",
      });
    } finally {
      // Remove temporary file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn("⚠️ Failed to delete temp file:", cleanupError);
      }
    }
  });
}
