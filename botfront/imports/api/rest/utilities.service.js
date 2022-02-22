import axios from 'axios';
import { safeLoad, safeDump } from 'js-yaml';
import { MongoInternals } from 'meteor/mongo';
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


export function getS3Url(region, bucket, key) {
  return `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
}

export async function createGlobalSettings() {
  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  const hasGlobalSettings = await db.listCollections({ name: 'admin_settings' }).hasNext();

  if (hasGlobalSettings) {
    const currentGlobalSettings = GlobalSettings.findOne({ _id: 'SETTINGS' });
    if (currentGlobalSettings != null) {
        return;
    }
  }
  
  const publicSettings = safeLoad(Assets.getText('defaults/public.yaml'));
  const privateSettings = safeLoad(Assets.getText(
      process.env.MODE === 'development'
          ? 'defaults/private.dev.yaml'
          : process.env.ORCHESTRATOR === 'gke' ? 'defaults/private.gke.yaml' : 'defaults/private.yaml',
  ));

  const settings = {
      public: {
          backgroundImages: publicSettings.backgroundImages || [],
          defaultNLUConfig: safeDump({ pipeline: publicSettings.pipeline }),
      },
      private: {
          bfApiHost: privateSettings.bfApiHost || '',
          defaultEndpoints: safeDump(privateSettings.endpoints),
          defaultCredentials: safeDump(privateSettings.credentials)
              .replace(/{SOCKET_HOST}/g, process.env.SOCKET_HOST || 'botfront.io'),
          defaultPolicies: safeDump({ policies: privateSettings.policies }),
          defaultDefaultDomain: safeDump(privateSettings.defaultDomain),
          webhooks: privateSettings.webhooks,
      },
  };
  await GlobalSettings.insert({ _id: 'SETTINGS', settings });
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


export async function informCdkSuccess(url) {
  if (url) {
    sendSuccessSignal(process.env.SIGNAL_URL);
    console.log(`Sent success signal to ${process.env.SIGNAL_URL}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms));
}

export async function waitUntilDatabaseIsReady() {
  const sleepInterval = 2000;
  let i = 10;
  while (await isDatabaseReady() === false && i > 0) {
    await sleep(sleepInterval);
    console.log('Waiting for database...');
    i--;
  }
}

async function isDatabaseReady() {
  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  const hasMigrationsCollection = await db.listCollections({ name: 'migrations' }).hasNext();
  if (!hasMigrationsCollection) {
    return false;
  }

  const { version } = Migrations._getControl();
  const latest = Migrations._list.length - 1;

  if (version !== latest) {
    return false;
  }

  return true;
}

function sendSuccessSignal(signalUrl) {
  axios.request({
    method: 'PUT',
    url: signalUrl,
    data: {
      Status: 'SUCCESS',
      Reason: 'Configuration Complete',
      UniqueId: Date.now().toString(),
      Data: 'Botfront is running successfully.',
    },
  });
}