
import { Meteor } from 'meteor/meteor';
import JSZIP from 'jszip';
import axios from 'axios';
import { print } from 'graphql';

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


import { importFilesMutation } from '../../ui/components/settings/graphql';
import { adminEmail, adminPassword } from './index';

const TOKEN_EXPIRATION = 1000 * 60 * 60;

let loginTokenCache = null;
const defaultLanguage = 'en';

const graphQLEndpoint = 'http://localhost:3000/graphql';


export function createProject(project) { //name, nameSpace, baseUrl, projectId, baseUrl, host, token, actionEndpoint) {
    const item = {
        disabled: false,
        name: project.name,
        namespace: project.nameSpace,
        defaultLanguage,
    };

    if (project.projectId != null) {
        item._id = project.projectId;
    }

    if (project.hasProd) {
        item.deploymentEnvironments = ['production'];
    }

    let _id;

    try {
        _id = insertProject(item);
    } catch (error) {
        const errorMessage = error?.writeErrors?.[0].err.errmsg;
        if (errorMessage && errorMessage.match(/duplicate key error/)) {
            console.log('already exists, update project in place');
        } else throw error;
    }

    // in case project existed, project creation failed resulting in undefined _id
    _id = _id || project.projectId;

    AnalyticsDashboards.create(defaultDashboard({ _id, ...item }));
    createEndpoints({ _id, ...item }, project.actionEndpoint, project.prodActionEndpoint, project.hasProd);
    createCredentials(_id, project.baseUrl, project.prodBaseUrl, project.hasProd);
    createPolicies({ _id, ...item });
    createNLUInstance({ _id, ...item }, project.host, project.token);
    auditLog('Created project', {
        user: getUser(),
        resId: _id,
        type: 'created',
        operation: 'project-created',
        after: { project: item },
        resType: 'project',
    });
    return _id;

}

export async function importProject(zipFile, projectId) {
    let files;
    try {
        files = await unZip(zipFile);
    } catch (error) {
        const newError = new Error(`Failed to extract zip file: ${JSON.stringify(error)}`);
        newError.statusCode = 400;
        throw newError;
    }
  
    let validationResult;
  
    try {
        validationResult = (await sendProjectImportRequest(projectId, files, true, true, true)).data;
    } catch (error) {
        throw new Error('Failed to validate extracted files');
    }


    // error message thrown, when the project does not exist
    if (validationResult?.errors?.findIndex(error => error.message = 'Cannot destructure property \'languages\' of \'Projects.findOne(...)') > -1) {
        const error = new Error('ProjectId does not exist');
        error.statusCode = 400;
        throw error;
    }

    if (validationResult.errors != null) {
        throw new Error('Invalid validation Result');
    }

    const validationErrors = validationResult?.data?.import?.fileMessages?.filter(({ errors }) => errors.length > 0);

    if (validationErrors == null) {
        throw new Error('Invalid validation Result');
    }

    if (validationErrors.length > 0) {
        const error = new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
        error.statusCode = 400;
        error.data = validationErrors;
        throw error;
    }


    // return [400, {'success': true}];

    try {
        const importResult = (await sendProjectImportRequest(projectId, files, false, true, true)).data;
        return importResult;
    } catch (error) {
        throw new Error(`Import failed: : ${JSON.stringify(error)}`);
    }
}

async function getAuthToken(email) {
    if (loginTokenCache != null && loginTokenCache.expires > Date.now()) {
        return loginTokenCache.token;
    }

    const user = Meteor.users.findOne({
        'emails.address': email,
    });

    const stampedLoginToken = Accounts._generateStampedLoginToken();
    Accounts._insertLoginToken(user._id, stampedLoginToken);
    loginTokenCache = { expires: Date.now() + TOKEN_EXPIRATION, token: stampedLoginToken.token };

    return stampedLoginToken.token;
}

async function sendProjectImportRequest(projectId, files, onlyValidate, wipeInvolvedCollections, wipeProject, fallbackLang = '') {
    const token = await getAuthToken(adminEmail);

    return axios.post(graphQLEndpoint, {
        query: print(importFilesMutation),
        variables: {
            projectId,
            files,
            onlyValidate,
            wipeInvolvedCollections,
            wipeProject,
            fallbackLang,
        },
    }, {
        headers: {
            authorization: token,
        },
    });
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

function insertProject(item) {
    auditLog('Created project', {
        user: getUser(),
        type: 'created',
        operation: 'project-created',
        after: { project: item },
        resType: 'project',
        resId: item.name,
    });
    debugger;
    const projectExists = item._id !== undefined ? Projects.findOne({ _id: item._id }) !== undefined : false;
    if (projectExists) {
        Projects.update({ _id: item._id }, {
            $set: {
                ...item,
            },
        });

        return item._id;
    }

    const projectId = Projects.insert({
        ...item,
        defaultDomain: { content: 'slots:\n  disambiguation_message:\n    type: any\n    influence_conversation: false\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping' },
        languages: [defaultLanguage],
        chatWidgetSettings: {
            title: item.name,
            subtitle: '',
            inputTextFieldHint: 'Type your message...',
            initPayload: '/get_started',
            hideWhenNotConnected: true,
        },
    });

    return projectId;
}


function generateCredentials(baseUrl) {
    return `rasa_addons.core.channels.webchat.WebchatInput:
    session_persistence: true
    base_url: '${baseUrl}'
    socket_path: /socket.io/
    rasa_addons.core.channels.bot_regression_test.BotRegressionTestInput: {}`;
}

function createCredentials(projectId, baseUrl, prodBaseUrl, hasProd) {
    Credentials.upsert({ projectId, environment: 'development' }, {
        $set: {
            projectId,
            environment: 'development',
            credentials: generateCredentials(baseUrl),
        },
    });

    if (hasProd && prodBaseUrl) {
        Credentials.upsert({ projectId, environment: 'production' }, {
            $set: {
                projectId,
                environment: 'production',
                credentials: generateCredentials(prodBaseUrl),
            }
        });
    }
}


function createNLUInstance(project, host, token) {
    const nluInstance = {
        name: 'Default Instance',
        host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
        projectId: project._id,
    };

    if (token) {
        nluInstance.token = token;
    }

    Instances.upsert({ projectId: project._id }, { $set: nluInstance });
}
