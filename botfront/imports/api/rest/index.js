import express from 'express';
import fileUpload from 'express-fileupload';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createGlobalSettings, createDummyBuckets, setStaticWebhooks, informCdkSuccess, waitUntilDatabaseIsReady } from './utilities.service';
import { createUser } from './users.service';
import { createProject, importProject } from './projects.service';
import { deleteFile, uploadFile } from './files.service';


export const region = process.env.AWS_DEFAULT_REGION || 'eu-north-1';
export const endpoint = process.env.AWS_ENDPOINT || '';

export const adminEmail = process.env.ADMIN_USER;
export const adminPassword = process.env.ADMIN_PASSWORD;

const FILE_SIZE_LIMIT = parseInt(process.env.FILE_SIZE_LIMIT, 10) || 1024 * 1024;

const fileBucket = process.env.FILE_BUCKET;
const modelBucket = process.env.MODEL_BUCKET;
const filePrefix = process.env.FILE_PREFIX || 'files/';

const port = process.env.REST_API_PORT || 3030;

const signalUrl = process.env.SIGNAL_URL;


// make sure the database hase been initialised completely before creating the user
Meteor.startup(async () => {
    try {
      // wait for all migrations to finish first
      await waitUntilDatabaseIsReady();
      await createGlobalSettings();

      informCdkSuccess(signalUrl);
      createAdminUser();
      
      const images = `http://localhost:${port}/api/images`;
      const deploy = `http://localhost:${port}/api/deploy`;
      setStaticWebhooks(images, deploy);
      if (endpoint) {
        const buckets = [fileBucket, modelBucket];
        buckets.forEach(createDummyBuckets);
      }

    } catch (error) {
      console.log({ error });
    }
});

async function createAdminUser() {
    // create admin on startup
    if (adminEmail != null && adminPassword != null) {
        try {
            await createUser({
                email: adminEmail,
                roles: [{ roles: ['global-admin'], project: 'GLOBAL' }],
                profile: { firstName: 'admin', lastName: 'admin', preferredLanguage: 'en' },
            }, adminPassword);
        } catch (error) {}
    }
}

const app = express();
app.use(express.urlencoded({ limit: FILE_SIZE_LIMIT, extended: true }));
app.use(express.json({ limit: FILE_SIZE_LIMIT }));
app.use(fileUpload({
    limits: { fileSize: FILE_SIZE_LIMIT },
}));

app.get('/api', (req, res, next) => {
    res.sendStatus(200);
});

/**
 * @swagger
 *  /api/users:
 *    put:
 *      create a new user
        Interface {
          email: string;
          password: string;
          roles?: [
            {
              roles: string[],
              project: string
            }
          ];
          profile?: {
            firstName: string;
            lastName: string;
            preferredLanguage: string'
          }
        }
 *
*/
app.put('/api/users', async (req, res, next) => {
  const inputs = req.body;

  if (inputs.email == null || inputs.password == null) {
    res.status(400).send('Missing email or password');
    return;
  }

  if (inputs.roles != null && (!Array.isArray(inputs.roles) || inputs.roles.length < 1)) {
    res.status(400).send({ error: 'Malformed or missing roles' });
    return;
  }

  const user = {
    email: inputs.email,
    roles: inputs.roles ?? [{ roles: ['global-admin'], project: 'GLOBAL' }],
    profile: inputs.profile ?? { firstName: 'generated', lastName: 'generated', preferredLanguage: 'en' }
  };

  try {
    const success = await createUser(user, inputs.password);
    res.send(success);
  } catch (error) {
    console.log({ error });
    res.status(500).send({ error });
  }
});


/**
 * @swagger
 *  /api/projects:
 *    put:
 *      create a new project
        Interface {
          name: string;
          nameSpace: string; // MUST START with `bf-`
          baseUrl: string; // the url under which the rasa bot instance is reachable
          projectId?: string // OPTIONAL, the projectId  used for creating the project
        }
 *
*/
app.put('/api/projects', async (req, res, next) => {
    const inputs = req.body;

    const isNameInvalid = inputs.name == null || typeof inputs.name !== 'string' || inputs.name.match(/^[a-zA-Z0-9]+$/) == null;
    const isNameSpaceInvalid = inputs.nameSpace == null || typeof inputs.nameSpace !== 'string' || inputs.nameSpace.match(/^bf-[a-zA-Z0-9-]+$/) == null;
    const isProjectIdInvalid = inputs.projectId != null && (typeof inputs.projectId !== 'string' || inputs.projectId.length < 1);
    const isBaseUrlInvalid = inputs.baseUrl == null || typeof inputs.baseUrl !== 'string' || inputs.baseUrl.match(/^(http|https):\/\//) == null;
    const isHostInvalid = inputs.host == null || typeof inputs.host !== 'string' || inputs.host.match(/^(http|https):\/\//) == null;
    const isTokenInvalid = (inputs.token != null && (typeof inputs.token !== 'string' || inputs.token.length < 1));
    const isActionEndpointInvalid = inputs.actionEndpoint == null || typeof inputs.actionEndpoint !== 'string' || inputs.actionEndpoint.match(/^(http|https):\/\//) == null;

    const hasProd = inputs.hasProd === true;
    const isProdBaseUrlInvalid = inputs.prodBaseUrl == null || typeof inputs.prodBaseUrl !== 'string' || inputs.prodBaseUrl.match(/^(http|https):\/\//) == null;
    const isProdActionEndpointInvalid = inputs.prodActionEndpoint == null || typeof inputs.prodActionEndpoint !== 'string' || inputs.prodActionEndpoint.match(/^(http|https):\/\//) == null;

    if (isNameInvalid || isNameSpaceInvalid || isProjectIdInvalid || isBaseUrlInvalid || isHostInvalid || isTokenInvalid || isActionEndpointInvalid
      // prod options
      || (hasProd && (isProdBaseUrlInvalid || isProdActionEndpointInvalid))
    ) {
        res.status(400).send('Malformed or missing inputs');
        return;
    }

    try {
        const projectId = await createProject(inputs);
        res.send({ projectId });
    } catch (error) {
        const errorMessage = error?.writeErrors?.[0].err.errmsg;
        if (errorMessage && errorMessage.match(/duplicate key error/)) {
            res.send({ projectId: inputs.projectId, alreadyExists: true });
            return;
        }
  
        console.log({ error });
        res.status(500).send({ error });
    }
});


/**
 * @swagger
 *  /api/projects/import:
 *    post:
 *      import a bot into a project.
 *      SEND DATA AS FORM-DATA
        Interface {
          file: blob; // a single zip file containing all required files
          projectId: string // the projectId used for importing into a project
        }
 *
*/
app.post('/api/projects/import', async (req, res, next) => {
  if (req.body.projectId == null || req.body.projectId.length < 1) {
    res.status(400).send({ error: 'Provide a projectId' });
    return;
  }

    const { projectId } = req.body;

    if (req.files?.file == null || req.files.file.mimetype !== 'application/zip') {
        res.status(400).send({ error: 'Send exactly one zip file' });
        return;
    }

    const file = req.files.file.data;

    try {
        const result = await importProject(file, projectId);

        if (result.errors != null) {
            throw new Error(JSON.stringify(result));
        }

        res.send({ projectId });
    } catch (error) {
        console.log({ error });
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send({ error: error.message });
    }
});



/**
 * @swagger
 *  /api/images:
 *    post:
 *      upload webhook for image upload
        Interface {
        "projectId": string,
        "data": string, // image encoded in base64
        "mimeType": string,
        "language": string,
        "responseId": string // template name followed by unix timestamp, e.g. utter_get_started_1588107073256
      }
 *     
*/

app.post('/api/images', async (req, res, next) => {
  const mimeType = req.body.mimeType;


  if (!mimeType || typeof mimeType !== 'string') {
    res.status(400).send(`Bad mime type: ${mimeType}`);
    return;
  }

  const [type, fileExtension] = mimeType.split('/');

  if (type !== 'image') {
    res.status(400).send(`Bad mime type: ${mimeType}`);
    return;
  }

  const data = req.body.data;

  if (data.length < 1) {
    res.status(400).send('Image has not content');
    return;
  }

  const key = `${filePrefix}${uuidv4()}.${fileExtension}`;

  try {
    const fileUrl = await uploadFile(fileBucket, key, data);
    res.json({ uri: fileUrl });
  } catch (error) {
    console.log({ error });
    res.sendStatus(400);
  }
});



/**
 * @swagger
 *  /api/images:
 *    delete:
 *      delete webhook for image delete
        Interface {
        "projectId": string,
        "uri": string
      }
 *     
*/

app.delete('/api/images', async (req, res, next) => {
  const mimeType = req.body.mimeType;


  if (!req.body.uri) {
    res.sendStatus(404);
    return;
  }

  const url = new URL(req.body.uri);
  const urlPath = url.pathname.split('/');

  const isRegionValid = region === url.hostname.split('.')[1];
  const isBucketValid = fileBucket === urlPath[1];

  if (!isBucketValid || !isRegionValid) {
    res.status(400).send('The s3Bucket or region in the provided URL are different from the configured s3Bucket and region');
    return;
  }

  const key = urlPath.slice(2).join('/');

  try {
    const fileUrl = await deleteFile(fileBucket, key);
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * @swagger
 *  /api/deploy:
 *    post:
 *      create new deployment for production rasa
        Interface {
        "projectId": string,
        "namespace": string,
        "environment": string,
        "gitString": string
      }
 *     
*/

app.post('/api/deploy', async (req, res, next) => {
  const projectId = req.body.projectId;
  const path = req.body.path || '/app/models';
  const modelFileName = req.body.modelFileName;
  const key = `model-${projectId}.tar.gz`;
  
  let data;
  
  try {
    data = await fs.readFile(`${path}/${modelFileName}`);
  } catch (error) {
    console.log(error);
  }

  if (data.length < 1 || data == null) {
    res.status(400).send('Model has not content');
    return;
  }

  try {
    const fileUrl = await uploadFile(modelBucket, key, data);
    res.json({ uri: fileUrl });
  } catch (error) {
    res.status(400).send('Upload failed');
  }
});


app.listen(port, () => {
  console.log(`REST API listening at port: ${port}`);
});
