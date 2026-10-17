import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable`);
  return value;
};

const client = () => new S3Client({
  region: 'auto',
  endpoint: requiredEnv('R2_ENDPOINT'),
  credentials: {
    accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
  },
});

export const sanitizeObjectName = (name: string): string =>
  name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

export const createR2UploadUrl = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: requiredEnv('R2_BUCKET_NAME'),
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 15 * 60 });
  const publicBase = requiredEnv('R2_PUBLIC_URL').replace(/\/$/, '');

  return {
    uploadUrl,
    publicUrl: `${publicBase}/${key.split('/').map(encodeURIComponent).join('/')}`,
  };
};
