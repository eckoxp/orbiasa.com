export type R2Folder = 'movies' | 'movie-thumbnails' | 'photos';

export class UploadError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

// Turns an upload error into a message for the current language.
export function describeUploadError(error: unknown, isRTL: boolean, fallback: string): { title?: string; text: string } {
  if (error instanceof UploadError && error.code === 'STORAGE_LIMIT') {
    return {
      title: isRTL ? 'تم الوصول للحد الأقصى للتخزين' : 'Storage limit reached',
      text: isRTL
        ? 'لا يمكن رفع ملفات جديدة. احذف بعض الأفلام أو الصور لتفريغ مساحة ثم حاول مرة أخرى.'
        : 'New uploads are disabled. Delete some movies or photos to free up space, then try again.',
    };
  }
  return { text: error instanceof Error && error.message ? error.message : fallback };
}

// Asks the server for a presigned URL, uploads the file straight to R2 from the
// browser, and resolves with the file's public URL.
export async function uploadFileToR2(
  file: File,
  folder: R2Folder,
  onProgress?: (percentage: number) => void
): Promise<string> {
  const prepareResponse = await fetch('/api/admin/r2-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, fileName: file.name, contentType: file.type, fileSize: file.size }),
  });
  const prepared = await prepareResponse.json().catch(() => ({}));
  if (!prepareResponse.ok) throw new UploadError(prepared.error || 'Could not prepare upload', prepared.code);

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', prepared.uploadUrl);
    request.setRequestHeader('Content-Type', file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`Upload failed (${request.status})`));
    request.onerror = () => reject(new Error('Upload failed. Check the R2 CORS configuration.'));
    request.send(file);
  });

  return prepared.publicUrl as string;
}