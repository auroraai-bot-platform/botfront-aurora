
import { auditLog } from '../../../server/logger';
import { Projects } from '../project/project.collection';

import { createEndpoints } from '../endpoints/endpoints.methods';
import { Credentials } from '../credentials';
import { createPolicies } from '../core_policies';
import { StoryGroups } from '../storyGroups/storyGroups.methods';

import { Instances } from '../instances/instances.collection';

import AnalyticsDashboards from '../graphql/analyticsDashboards/analyticsDashboards.model';
import { defaultDashboard } from '../graphql/analyticsDashboards/generateDefaults';
import { getUser } from './utilities.service';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';


import { Meteor } from 'meteor/meteor';
import JSZIP from 'jszip';
import axios from 'axios';
import { print } from 'graphql';
import { importFilesMutation } from '../../ui/components/settings/graphql';
import { adminEmail, adminPassword } from '.';

let loginTokenCache = '9MFdAaMi4GALsYtXXJeQcunMeU8SRvbTHRGtgD3B2WM=';

const graphQLEndpoint = 'http://localhost:3000/graphql';


export async function createProject(name, nameSpace, baseUrl, id) {

  const item = {
    disabled: false,
    name: name,
    namespace: nameSpace,
    defaultLanguage: 'en'
  };

  if (id != null) {
    item._id = id;
  }

  let _id;
  try {
    _id = insertProject(item);
    console.log({ _id });
    AnalyticsDashboards.create(defaultDashboard({ _id, ...item }));
    createEndpoints({ _id, ...item });
    createCredentials(_id, baseUrl);
    createPolicies({ _id, ...item });
    await createNLUInstance({ _id, ...item }, baseUrl);
    auditLog('Created project', {
      user: getUser(),
      resId: _id,
      type: 'created',
      operation: 'project-created',
      after: { project: item },
      resType: 'project',
    });
    return _id;
  } catch (error) {
    console.log({ error });
  }
}

export async function importProject(zipFile) {
  const projectId = 'chitchat-IlTlxlHTF';
  const files = await unZip(zipFile);

  const validationResult = await sendProjectImportRequest(projectId, files, true, true, true, 'fi');

  const hasErrors = validationResult?.data?.import?.fileMessages?.some(({errors}) => errors.length > 0);
  if (hasErrors) {
    throw new Error(validationResult);
  }

  return validationResult;
}

async function getAuthToken(email) {

  // if (loginTokenCache != null) {
  //   return loginTokenCache;
  // }
  const user = Meteor.users.findOne({
    'emails.address': email
  });

  const stampedLoginToken = Accounts._generateStampedLoginToken();
  Accounts._insertLoginToken(user._id, stampedLoginToken);
  loginTokenCache = stampedLoginToken.token;

  return loginTokenCache;
}

async function sendProjectImportRequest(projectId, files, onlyValidate, wipeInvolvedCollections, wipeProject, fallbackLang) {
  const token = await getAuthToken();

  return axios.post(graphQLEndpoint, {
    query: print(importFilesMutation),
    variables: {
      projectId,
      files,
      onlyValidate,
      wipeInvolvedCollections,
      fallbackLang,
    }
  }, {headers: {
    'authorization': token
  }});
}


async function unZip(zipFile) {
  const zip = new JSZIP();
  const loadedZip = await zip.loadAsync(zipFile);
  const files = await Promise.all(
    Object.keys(loadedZip.files).map(async (fileName) => {
      const fileData = await loadedZip.files[fileName].async('string');
      if (/([a-z-0-9]+\/)+$/.test(fileName)) {
        // this regex detect folder in the shape of aa/bbb/
        return null; // we don't want folders in the file array
      }
      return { filename: fileName.replace(/([a-z-0-9]+\/)+/, ''), rawText: fileData }; // keep only the name of the file ditch the path part
    }),
  );

  return files;
}


// function validateImport(filestoSend) {
//   const validationResult = await importFiles({
//     variables: {
//         projectId,
//         files: filestoSend,
//         onlyValidate: true,
//         wipeInvolvedCollections,
//         wipeProject,
//         fallbackLang: fallbackImportLanguage,
//     },
// });
// }

function createGraphQLRequest(files) {
  const request = '';
}

function createfilePayloads(files) {
  return files.map(([name, content], index) => {
    const payload = `Content-Disposition: form-data; name="${index}"; filename="${name}"\nContent-Type: application/octet-stream\n\n${content}\n`;
    return payload;
  });
}

function insertProject(item) {
  auditLog('Created project', {
    user: getUser(),
    type: 'created',
    operation: 'project-created',
    after: { project: item },
    resType: 'project',
    resId: item.id,
  });

  const projectId = Projects.insert({
    ...item,
    defaultDomain: { content: 'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping' },
    chatWidgetSettings: {
      title: item.name,
      subtitle: 'Happy to help',
      inputTextFieldHint: 'Type your message...',
      initPayload: '/get_started',
      hideWhenNotConnected: true,
    },
  });

  return projectId;
}

function createCredentials(projectId, baseUrl) {
  const credentials = `rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: '${baseUrl}'
  socket_path: /socket.io/
  rasa_addons.core.channels.bot_regression_test.BotRegressionTestInput: {}`;

  ENVIRONMENT_OPTIONS.forEach(environment => Credentials.insert({
    projectId,
    environment,
    credentials: credentials,
  }));
}

function createStoriesWithTriggersGroup(projectId) {
  storyGroup = {
    name: 'Stories with triggers',
    projectId,
    smartGroup: { prefix: 'withTriggers', query: '{ "rules.0": { "$exists": true } }' },
    isExpanded: true,
    pinned: true,
  };

  createStoryGroup(projectId, storyGroup);
}

function createUnpublishedStoriesGroup(projectId) {
  const storyGroup = {
    name: 'Unpublished stories',
    projectId,
    smartGroup: { prefix: 'unpublish', query: '{ "status": "unpublished" }' },
    isExpanded: false,
    pinned: true,
  };

  createStoryGroup(projectId, storyGroup);
}

function createStoryGroup(projectId, storyGroup) {
  try {
    const id = StoryGroups.insert({
      ...storyGroup,
      children: [],
    });
    const $position = 0;

    Projects.update(
      { _id: projectId },
      { $push: { storyGroups: { $each: [id], $position } } },
    );
    auditLog('Created a story group', {
      resId: id,
      user: getUser(),
      projectId: storyGroup.projectId,
      type: 'created',
      operation: 'story-group-created',
      after: { storyGroup },
      resType: 'story-group',
    });
    return id;
  } catch (error) {
    console.log({ error });
  }
}

function createNLUInstance(project, host) {
  return Instances.insert({
    name: 'Default Instance',
    host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
    projectId: project._id,
  });
}