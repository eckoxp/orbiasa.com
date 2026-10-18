import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

// Removes files that a record no longer uses after an edit (best effort), so they do not
// keep taking space in the bucket. Files that are still in use are kept.
export const deleteReplacedR2Files = async (
  oldUrls: (string | null | undefined)[],
  currentUrls: (string | null | undefined)[]
): Promise<void> => {
  const inUse = new Set(currentUrls.filter(Boolean));
  for (const url of oldUrls) {
    if (!url || inUse.has(url)) continue;
    try {
      await deleteR2ObjectByUrl(url);
    } catch (error) {
      console.error('R2 cleanup failed:', error);
    }
  }
};

// ---- Storage meter ----------------------------------------------------------------
// Decimal units (1 GB = 1,000,000,000 bytes), like storage providers' dashboards.
const GB = 1000 ** 3;

// The limit is ours, not Cloudflare's. Change it with STORAGE_LIMIT_GB (default 200).
export const getStorageLimitBytes = (): number => {
  const gb = Number(process.env.STORAGE_LIMIT_GB);
  return (Number.isFinite(gb) && gb > 0 ? gb : 200) * GB;
};

// Adds up the size of every file currently in the bucket. Files that still live on
// Vercel Blob are not in R2, so they are not counted.
export const getR2Usage = async (): Promise<{ usedBytes: number; objectCount: number }> => {
  const r2 = client();
  const Bucket = requiredEnv('R2_BUCKET_NAME');
  let usedBytes = 0;
  let objectCount = 0;
  let token: string | undefined;
  do {
    const page = await r2.send(new ListObjectsV2Command({ Bucket, ContinuationToken: token }));
    for (const object of page.Contents ?? []) {
      usedBytes += object.Size ?? 0;
      objectCount += 1;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return { usedBytes, objectCount };
};