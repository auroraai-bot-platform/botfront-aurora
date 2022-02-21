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
  return process.env.AWS_LOCAL? `${process.env.AWS_ENDPOINT}/${bucket}/${key}`: `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
}


export function setStaticWebhooks(images, deploy) {
  const settings = {
    'settings.private.webhooks.uploadImageWebhook': {
      name: 'UploadImage',
      method: 'POST',
      url: images
    },
    'settings.private.webhooks.deleteImageWebhook': {
      name: 'DeleteImage',
      method: 'DELETE',
      url: images
    },
    'settings.private.webhooks.deploymentWebhook': {
      name: 'DeployProject',
      method: 'POST',
      url: deploy
    }
  };

  try {
    GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
  } catch (error) {
    console.log({ error })
  }
}
