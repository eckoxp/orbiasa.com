import { NextResponse } from 'next/server';
import { createR2UploadUrl, sanitizeObjectName } from '@/lib/r2';

const MB = 1024 * 1024;
const GB = 1024 * MB;

// Each folder accepts only its own kind of file, with its own size limit.
const rules = {
  movies: { types: /^video\/(mp4|webm|quicktime)$/, maxSize: 5 * GB, label: '5 GB' },
  'movie-thumbnails': { types: /^image\/(jpeg|png|webp|gif)$/, maxSize: 10 * MB, label: '10 MB' },
  photos: { types: /^image\/(jpeg|png|webp|gif)$/, maxSize: 25 * MB, label: '25 MB' },
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folder = String(body.folder || '');
    const fileName = sanitizeObjectName(String(body.fileName || 'file'));
    const contentType = String(body.contentType || 'application/octet-stream');
    const fileSize = Number(body.fileSize || 0);

    if (!(folder in rules)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    }
    const rule = rules[folder as keyof typeof rules];
    if (!rule.types.test(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type for this upload' }, { status: 400 });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > rule.maxSize) {
      return NextResponse.json({ error: `File size must be between 1 byte and ${rule.label}` }, { status: 400 });
    }

    const key = `${folder}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
    return NextResponse.json(await createR2UploadUrl(key, contentType, fileSize));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not prepare upload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}