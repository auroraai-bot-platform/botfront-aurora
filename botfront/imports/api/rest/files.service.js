import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Url } from './utilities.service';
import { region, endpoint } from './index';

export async function uploadFile(outputBucket, key, data) {

  const buffer = Buffer.from(data, 'base64');

  const fileUrl = getS3Url(region, outputBucket, key);

  const s3 = new S3Client({ region, endpoint, forcePathStyle: endpoint? true : false });
  await s3.send(new PutObjectCommand({ Bucket: outputBucket, Key: key, Body: buffer }));

  return fileUrl;
}

export async function deleteFile(bucket, key) {
  const s3 = new S3Client({ region, endpoint, forcePathStyle: endpoint? true : false });
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
