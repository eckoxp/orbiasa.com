import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable`);
  return value;
};

const client = () => new S3Client({
  region: 'auto',
  // R2 does not support the default CRC32 checksums newer SDK versions add to presigned URLs.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  endpoint: requiredEnv('R2_ENDPOINT'),
  credentials: {
    accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
  },
});

export const sanitizeObjectName = (name: string): string =>
  name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

export const createR2UploadUrl = async (key: string, contentType: string, contentLength: number) => {
  const command = new PutObjectCommand({
    Bucket: requiredEnv('R2_BUCKET_NAME'),
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength, // signed, so the upload must be exactly this size
  });

  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 15 * 60 });
  const publicBase = requiredEnv('R2_PUBLIC_URL').replace(/\/$/, '');

  return {
    uploadUrl,
    publicUrl: `${publicBase}/${key.split('/').map(encodeURIComponent).join('/')}`,
  };
};

// Deletes a file from R2 given its public URL. URLs that are not ours (old Vercel Blob
// files, external links) are ignored on purpose.
export const deleteR2ObjectByUrl = async (url: string | null | undefined): Promise<void> => {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  if (!url || !base || !url.startsWith(`${base}/`)) return;
  const key = url.slice(base.length + 1).split('/').map(decodeURIComponent).join('/');
  await client().send(new DeleteObjectCommand({ Bucket: requiredEnv('R2_BUCKET_NAME'), Key: key }));
};