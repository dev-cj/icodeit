import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../../config/config';

const s3Config = {
  credentials: {
    accessKeyId: config.aws.s3.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.aws.s3.AWS_SECRET_ACCESS_KEY,
  },
  region: 'us-east-1',
};

const client = new S3Client(s3Config);

async function getSignedFileUrl(fileName: string, bucket: string, expiresIn = 10800) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

const createPutSignedFileUrl = async (fileName: string, bucket: string, expiresIn = 10800) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

export { createPutSignedFileUrl, getSignedFileUrl };
