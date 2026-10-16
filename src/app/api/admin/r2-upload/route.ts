import { NextResponse } from 'next/server';
import { createR2UploadUrl, sanitizeObjectName } from '@/lib/r2';

const allowedFolders = new Set(['movies', 'movie-thumbnails', 'photos']);
const allowedTypes = /^(video\/(mp4|webm|quicktime)|image\/(jpeg|png|webp|gif))$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folder = String(body.folder || '');
    const fileName = sanitizeObjectName(String(body.fileName || 'file'));
    const contentType = String(body.contentType || 'application/octet-stream');
    const fileSize = Number(body.fileSize || 0);

    if (!allowedFolders.has(folder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    }
    if (!allowedTypes.test(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be between 1 byte and 5 GB' }, { status: 400 });
    }

    const key = `${folder}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
    return NextResponse.json(await createR2UploadUrl(key, contentType));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not prepare upload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
