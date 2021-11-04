import { S3 } from '@aws-sdk/client-s3';
import { getS3Url } from './utilities.service';

const region = 'eu-north-1';

export async function uploadImage(outputBucket, key, data) {

  const buffer = Buffer.from(data, 'base64');

  const fileUrl = getS3Url(region, outputBucket, key);

  const s3 = new S3({ region });

  await s3.putObject({ Bucket: outputBucket, Key: key, Body: buffer });

  return fileUrl;
}

export async function deleteImage(bucket, key) {
  const s3 = new S3(region);
  await s3.deleteObject({ Bucket: bucket, Key: key });
}