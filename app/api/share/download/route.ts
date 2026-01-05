import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Extract the path from the URL
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract the path parts after /api/share/download/
    const pathParts = pathname.split('/').filter(part => part !== '');
    const apiIndex = pathParts.indexOf('api');
    const shareIndex = pathParts.indexOf('share');
    const downloadIndex = pathParts.indexOf('download');
    
    if (downloadIndex === -1 || downloadIndex >= pathParts.length - 1) {
      return new Response('File ID not provided', { status: 400 });
    }
    
    const fileId = pathParts[downloadIndex + 1];
    const fileName = pathParts[downloadIndex + 2];
    
    // Sanitize the file ID and name to prevent directory traversal
    if (!fileId || !fileName || /(\.\.\/|\/\.\.)/.test(fileId) || /(\.\.\/|\/\.\.)/.test(fileName)) {
      return new Response('Invalid file ID or name', { status: 400 });
    }
    
    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', `${fileId}-${fileName}`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return new Response('File not found', { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Get the file stats to set content length
    const stats = await fs.stat(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase();
    const contentType = getContentType(ext) || 'application/octet-stream';
    
    // Create response with file content
    const response = new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Helper function to determine content type based on file extension
function getContentType(ext: string): string | null {
  const contentTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  return contentTypes[ext] || null;
}