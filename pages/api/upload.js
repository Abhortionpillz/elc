// /api/upload.js

import { put } from '@vercel/blob';
import formidable from 'formidable';
import { promises as fs } from 'fs'; // 💡 Use the promises API for async reading

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Wrap formidable parsing in a promise to use await
  const [fields, files] = await new Promise((resolve, reject) => {
    const form = formidable({});
    
    // Disable file saving to disk if you can use streams, but for reliable file parsing 
    // in Vercel API routes, using the default disk path and reading it asynchronously is common.
    // Ensure the default uploadDir works for your Vercel environment.

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve([fields, files]);
    });
  }).catch((err) => {
    console.error('Formidable Error:', err);
    res.status(500).json({ error: 'Error processing file upload.' });
    return [null, null];
  });

  if (!files || !files.file) {
    // Already responded with 500 if parsing failed, otherwise return 400
    if (!res.headersSent) {
      res.status(400).json({ error: 'No file received.' });
    }
    return;
  }
  
  const file = files.file[0];

  try {
    // 💡 FIX: Read the file data asynchronously from the temporary location
    const fileData = await fs.readFile(file.filepath);

    const blob = await put(file.originalFilename, fileData, {
      access: 'public',
      addRandomSuffix: true, // Recommended to prevent name collisions
    });

    // Clean up the temporary file after successful upload
    await fs.unlink(file.filepath); 

    // Success response
    res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error("Vercel Blob Upload Failed:", error);

    // This block is crucial for debugging
    if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      res.status(500).json({ error: 'Server Configuration Error: BLOB_READ_WRITE_TOKEN is missing or invalid.' });
    } else {
      res.status(500).json({ error: 'Failed to upload file to Vercel Blob.' });
    }
    
    // Attempt to clean up the temporary file path even on failure
    try {
        await fs.unlink(file.filepath);
    } catch(cleanupError) {
        // Ignore cleanup errors
    }
  }
}
