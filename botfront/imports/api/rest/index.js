import express from 'express';
import fileUpload from 'express-fileupload';
import utilitiesService from './utilities.service';
import {createUser} from './users.service';
import projectsService, { importProject } from './projects.service';

const FILE_SIZE_LIMIT = 1024 * 1024;

const port = process.env.REST_API_PORT || 3030;
const restApiToken = process.env.REST_API_TOKEN;
export const adminEmail = process.env.ADMIN_USER || 'johannes.feig@gofore.com';
export const adminPassword = process.env.ADMIN_PASSWORD || '46qSJYyCAFvSn6q';

createAdminUser();

async function createAdminUser() {
  // create admin on startup
  if (adminEmail != null && adminPassword != null) {
    try {
      await createUser({
        email: adminEmail,
        roles: [{ roles: ['global-admin'], project: 'GLOBAL' }],
        profile: { firstName: 'admin', lastName: 'admin', preferredLanguage: 'en' }
      }, adminPassword);
    } catch (error) {
    }
  }
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: FILE_SIZE_LIMIT },
}));

app.get('/api', (req, res, next) => {
  res.sendStatus(200);
})

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
app.put('/api/users', utilitiesService.authMW(restApiToken), async (req, res, next) => {
  const inputs = req.body;

  if (inputs.email == null || inputs.password == null) {
    res.status(400).send('Missing email or password');
    return;
  }

  if (inputs.roles != null && (!Array.isArray(inputs.roles) || inputs.roles.length < 1)) {
    res.status(400).send('Malformed or missing roles');
    return;
  }

  const user = {
    email: inputs.email,
    roles: inputs.roles ?? [{ roles: ['global-admin'], project: 'GLOBAL' }],
    profile: inputs.profile ?? { firstName: 'generated', 'lastName': 'generated', preferredLanguage: 'en' }
  };

  try {
    const success = await usersService.createUser(user, inputs.password);
    res.send(success);
  } catch (error) {
    console.log({ error });
    res.status(500).send(error);
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
app.put('/api/projects', utilitiesService.authMW(restApiToken), async (req, res, next) => {
  const inputs = req.body;

  if (inputs.name == null || typeof inputs.name !== 'string' || inputs.name.match(/^[a-zA-Z0-9]+$/) == null
    || inputs.nameSpace == null || typeof inputs.nameSpace !== 'string' || inputs.nameSpace.match(/^bf-[a-zA-Z0-9-]+$/) == null
    || inputs.baseUrl == null || typeof inputs.baseUrl !== 'string' || inputs.baseUrl.match(/^(http|https):\/\//) == null
    || (inputs.projectId != null && (typeof inputs.projectId !== 'string' || inputs.projectId.length < 1))
  ) {
    res.status(400).send('Malformed or missing inputs');
    return;
  }

  try {
    const projectId = await projectsService.createProject(inputs.name, inputs.nameSpace, inputs.baseUrl, inputs.projectId);

    if (projectId == null) {
      res.send('Project already exists.');
    }

    res.send({ projectId });
  } catch (error) {
    console.log({ error });
    res.status(500).send(error);
  }
});

app.post('/api/projects/import', utilitiesService.authMW(restApiToken), async (req, res, next) => {
  console.log(req.files);

  if (req.files?.files != null || req.files.file.mimetype !== 'application/zip') {
    res.status(400).send('Send exactly one zip file');
  }

  try {
    const [statusCode, result]= await importProject(req.files.file.data);
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json(error);
  }
});


app.listen(port, () => {
  console.log(`REST API listening at port: ${port}`);
})