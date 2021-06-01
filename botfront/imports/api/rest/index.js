import { WebApp } from 'meteor/webapp'; 
import express from 'express';
import restService from './rest.service';

const app = express();

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
app.put('/api/users', fetchBody, async(req, res, next) => {
  console.log("req ", req.body);

  const inputs = JSON.parse(req.body);

  if (inputs.email == null || inputs.password == null) {
    res.status(400).send('Missing email or password');
    return;
  }

  if (inputs.roles != null && typeof !Array.isArray(inputs.roles) && inputs.roles.length < 1) {
    res.status(400).send('Malformed or missing roles');
    return;
  }

  const user = {
    email: inputs.email,
    roles: inputs.roles ?? [{roles: ['global-admin'], project: 'GLOBAL'}],
    project: inputs.project ?? 'GLOBAL',
    profile: inputs.profile ?? {firstName: 'generated', 'lastName': 'generated', preferredLanguage: 'en'}
  };

  console.log({inputs});

  try {
    const success = await restService.createUser(user, inputs.password);
    res.send(success);
  } catch (error) {
    res.status(500).send(error);
  }
});

WebApp.rawConnectHandlers.use(app);

function fetchBody(req, res, next) {
  let body = "";

  req.on('data', Meteor.bindEnvironment(function (data) {
    body += data;
  }));

  req.on('end', Meteor.bindEnvironment(function () {
    req.body = body;
    next();
  }));
}
