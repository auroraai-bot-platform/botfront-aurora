import { expect, assert } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client } from '@aws-sdk/client-s3';
import { uploadImage } from './images.service';
import axios from 'axios';

const baseUrl = 'http://localhost:3030/api';

const outputBucket = 'test-bucket-123';
const key = 'testfile.png';
const buffer = Buffer.from('HELLO WORLD');
const data = buffer.toString('Base64');

let client;

describe('image rest api tests', () => {
  before(() => {
    client = mockClient(S3Client);
  });

  it('REST: should upload the image, return an accessible url and delete it', async () => {

    const uploadData = {
      projectId: 'test',
      data: 'test',
      mimeType: 'image/png',
      language: 'fi',
      responseId: 'utter_get_started_1588107073256'
    };

    const uploadResult = await axios.post(`${baseUrl}/images`, uploadData);

    assert.equal(uploadResult.status, 200);
    assert.isString(uploadResult.data?.uri);

    const deleteData = {
      projectId: 'test',
      'uri': uploadResult.data.uri
    };

    const deleteResult = await axios.request({ url: `${baseUrl}/images`, method: 'DELETE', data: deleteData, validateStatus: false });

    assert.equal(deleteResult.status, 204, 'Deletion failed');
  });
});