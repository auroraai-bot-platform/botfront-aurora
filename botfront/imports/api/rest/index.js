import { WebApp } from 'meteor/webapp'; 
import express from 'express';
import utilitiesService from './utilities.service';
import usersService from './users.service';
import projectsService from './projects.service';

const app = express();
const restApiToken = process.env.REST_API_TOKEN;

const adminEmail = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

// create admin on startup
if (adminEmail != null && adminPassword != null) {
  restService.createUser({
    email: adminEmail,
    roles: [{roles: ['global-admin'], project: 'GLOBAL'}],
    profile: {firstName: 'admin', lastName: 'admin', preferredLanguage: 'en'}
  }, adminPassword);
}

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
app.put('/api/users', utilitiesService.fetchBodyMW, utilitiesService.authMW(restApiToken), async(req, res, next) => {
  let inputs;
  
  try {
    inputs = JSON.parse(req.body);
  } catch (error) {
    console.log({error});
    res.status(400).send('Invalid JSON');
    return;
  }

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
    roles: inputs.roles ?? [{roles: ['global-admin'], project: 'GLOBAL'}],
    profile: inputs.profile ?? {firstName: 'generated', 'lastName': 'generated', preferredLanguage: 'en'}
  };

  try {
    const success = await usersService.createUser(user, inputs.password);
    res.send(success);
  } catch (error) {
    console.log({error});
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
app.put('/api/projects', utilitiesService.fetchBodyMW, utilitiesService.authMW(restApiToken), async (req, res, next) => {
  let inputs;
  try {
    inputs = JSON.parse(req.body);
  } catch (error) {
    console.log({error});
    res.status(400).send('Invalid JSON');
    return;
  }
  
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

    res.send({projectId});
  } catch (error) {
    console.log({error});
    res.status(500).send(error);
  }
});

WebApp.connectHandlers.use(app);

