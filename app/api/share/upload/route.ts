import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Increase the maximum allowed file size to 100MB
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 100MB limit' }, { status: 400 });
    }

    // Create a unique ID for the file
    const fileId = generateFileId();
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Create the file path
    const filePath = path.join(uploadDir, `${fileId}-${file.name}`);
    
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    return Response.json({ id: fileId });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Generate a unique ID for the file
function generateFileId(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}