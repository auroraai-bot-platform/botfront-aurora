import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Url } from './utilities.service';
import { region } from './index';

export async function uploadImage(outputBucket, key, data) {

  const buffer = Buffer.from(data, 'base64');

  const fileUrl = getS3Url(region, outputBucket, key);

  const s3 = new S3Client({ region });
  await s3.send(new PutObjectCommand({ Bucket: outputBucket, Key: key, Body: buffer }));

  return fileUrl;
}

export async function deleteImage(bucket, key) {
  const s3 = new S3Client({ region });
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}