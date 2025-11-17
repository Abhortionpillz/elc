import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';
import { extname } from 'path';

// IMPORTANT: This configuration is necessary to tell Next.js/Vercel to disable 
// its default body parser, allowing 'formidable' to handle the raw file data.
export const config = {
  api: { bodyParser: false },
};

// Utility function to generate a unique filename
// This prevents users from overwriting files with the same name.
function generateUniqueFilename(originalFilename) {
  const fileExt = extname(originalFilename);
  const fileName = originalFilename.replace(fileExt, '');
  const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  return `${fileName}-${uniqueId}${fileExt}`;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      // Check if a file was actually uploaded
      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      try {
        // Read the file data from the temporary path created by formidable
        const fileData = fs.readFileSync(file.filepath);
        
        // Generate a unique filename and prefix it with a directory for organization
        const uniqueFilename = generateUniqueFilename(file.originalFilename);
        const blobPath = `product-images/${uniqueFilename}`;

        // Upload the file to Vercel Blob storage
        // NOTE: This requires the BLOB_READ_WRITE_TOKEN environment variable to be set.
        const blob = await put(blobPath, fileData, {
          access: 'public', // Makes the file publicly accessible via its URL
          contentType: file.mimetype,
        });
        
        // Return the public URL of the uploaded image to the frontend (admin.html)
        // The frontend will use this URL to save the product to the database.
        res.status(200).json({ url: blob.url });
        
      } catch (uploadError) {
        console.error('Vercel Blob Upload Failed:', uploadError);
        // Ensure the error message doesn't reveal sensitive environment details
        res.status(500).json({ 
          error: 'Failed to upload image to storage.',
          details: 'Check BLOB_READ_WRITE_TOKEN and Vercel Blob configuration.'
        });
      } finally {
        // Clean up the temporary file created by formidable
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Could not delete temporary file:', cleanupError);
        }
      }
    });
  } else {
    // Respond with Method Not Allowed for non-POST requests
    res.status(405).json({ error: 'Method not allowed' });
  }
}