import { formatError } from '../../lib/utils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export function getUser() {
  return {
    profile: {
      firstName: 'rest',
      lastName: 'api'
    },
    emails: [
      { address: 'restservice@example.com' }
    ]
  };
}

export function authMW(token) {
  return (function (req, res, next) {
    if (token == null || token.length < 1) {
      res.status(500).json({ error: 'Token configuration missing' });
      return;
    }

    if (req.headers.authorization !== token) {
      res.sendStatus(401);
      return;
    }

    next();
  });
}

export function getS3Url(region, bucket, key) {
  return `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
}


export function setImageWebhooks(url) {
  const settings = {
    'settings.private.webhooks.uploadImageWebhook': {
      name: 'UploadImage',
      method: 'POST',
      url: url
    },
    'settings.private.webhooks.deleteImageWebhook': {
      name: 'DeleteImage',
      method: 'DELETE',
      url: url
    }
  };

  try {
    GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
  } catch (error) {
    console.log({ error })
  }
}
