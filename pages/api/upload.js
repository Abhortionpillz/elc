// pages/api/upload.js (FIXED VERSION)

// Use promises API for asynchronous file operations
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { promises as fs } from 'fs'; 

// Disable Vercel's default body parser to use formidable
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  try {
    // 1. Parse the request asynchronously using a Promise
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // 2. Extract the file (assuming field name is 'file')
    const fileArray = files.file; 
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file received.' });
    }
    const file = fileArray[0];

    // 3. Read the temporary file asynchronously
    const fileData = await fs.readFile(file.filepath);

    // 4. Upload to Vercel Blob
    const blob = await put(file.originalFilename, fileData, {
      access: 'public',
    });
    
    // 5. Clean up the temporary file (important for serverless memory)
    await fs.unlink(file.filepath); 

    // 6. Return the public URL
    return res.status(200).json({ url: blob.url });
    
  } catch (err) {
    console.error("Upload Error:", err);
    
    // Catch common errors like the 4.5MB limit
    if (err.message && err.message.includes('413')) {
         return res.status(413).json({ error: 'File too large. Vercel Serverless Functions limit is 4.5 MB.' });
    }
    
    return res.status(500).json({ error: 'Failed to process file upload. Check Vercel logs.', detail: err.message });
  }
}
