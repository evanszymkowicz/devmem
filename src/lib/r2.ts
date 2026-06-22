import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  return getClient();
}

export function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set");
  return bucket;
}

function getClient(): S3Client {
  if (_client) return _client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 not configured: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY required",
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return _client;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: getBucket(), Key: key, ContentType: contentType }),
    { expiresIn: 3600, signableHeaders: new Set(["content-type"]) },
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}

export async function getR2Object(key: string) {
  return getClient().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}
