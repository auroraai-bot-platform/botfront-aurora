/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { check, Match } from 'meteor/check';
import axiosRetry from 'axios-retry';
import yaml from 'js-yaml';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

import {
    createAxiosForRasa,
    formatError,
    getProjectModelLocalFolder,
    getProjectModelFileName,
} from '../../lib/utils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { getExamples } from '../graphql/examples/mongo/examples';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import { checkIfCan } from '../../lib/scopes';
import Activity from '../graphql/activity/activity.model';
import { getFragmentsAndDomain } from '../../lib/story.utils';
import { dropNullValuesFromObject } from '../../lib/client.safe.utils';
import { Projects } from '../project/project.collection';

const removeUserFromEntitySteps = (stories_or_rules) => {
    stories_or_rules.forEach(story => {
        story.steps.forEach(step => {
            if (step?.entities?.length > 0)
                delete step["user"];
        })
    });
}

const replaceMongoReservedChars = (input) => {
    if (Array.isArray(input)) return input.map(replaceMongoReservedChars);
    if (typeof input === 'object') {
        const corrected = input;
        Object.keys(input).forEach((key) => {
            const newKeyName = key.replace(/\./g, '_');
            corrected[newKeyName] = replaceMongoReservedChars(input[key]);
            if (newKeyName !== key) delete corrected[key];
        });
        return corrected;
    }
    return input;
};

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    const { instance: host } = yaml.safeLoad(
        Assets.getText(
            process.env.MODE === 'development'
                ? 'defaults/private.dev.yaml'
                : process.env.ORCHESTRATOR === 'gke'
                    ? 'defaults/private.gke.yaml'
                    : 'defaults/private.yaml',
        ),
    );

    return Instances.insert({
        name: 'Default Instance',
        host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
        projectId: project._id,
    });
};

export const processExportNluExampleEntities = (text, entities) => {
    // sort entities by start index so the string modifications will work correctly
    entities.sort((a, b) => a.start - b.start);

    // process entities into array of correctly formatted entity strings
    const entityExamples = [];
    for (const entity of entities) {
        let entityExample = text.slice(entity.start, entity.end);
        if ('role' in entity || 'group' in entity || ('value' in entity && entity.value != entityExample)) {
            const entityCopy = {
                ...entity,
            };

            if (entityCopy.role === null) {
                delete entityCopy.role;
            }
            if (entityCopy.group === null) {
                delete entityCopy.group;
            }

            delete entityCopy.start;
            delete entityCopy.end;
            if ('value' in entityCopy && entityCopy.value === entityExample) {
                delete entityCopy.value;
            }
            entityExample = `[${entityExample}]${JSON.stringify(entityCopy)}`;
        } else {
            entityExample = `[${entityExample}](${entity.entity})`;
        }
        entityExamples.push(entityExample);
    }

    // lastly replace original text with correctly formatted entity strings
    // loop entities reversed so their 'start' and 'end' indexes will remain correct while modifying the string
    for (const entity of entities.reverse()) {
        text = text.substring(0, entity.start) + entityExamples.pop() + text.substring(entity.end);
    }
    return text;
};

export const getNluDataAndConfig = async (projectId, language, intents) => {
    const model = await NLUModels.findOne(
        { projectId, language },
        { training_data: 1, config: 1 },
    );
    if (!model) {
        throw new Error(`Could not find ${language} model for project ${projectId}.`);
    }
    const copyAndFilter = ({
        _id, mode, min_score, ...obj
    }) => obj;
    let {
        training_data: { entity_synonyms, fuzzy_gazette, regex_features },
        config,
    } = model;
    const { examples = [] } = await getExamples({
        projectId,
        language,
        intents,
        pageSize: -1,
        sortKey: 'intent',
        order: 'ASC',
    });
    let common_examples = examples.filter(e => !e?.metadata?.draft);
    const missingExamples = Math.abs(Math.min(0, common_examples.length - 2));
    for (let i = 0; (intents || []).length && i < missingExamples; i += 1) {
        common_examples.push({
            text: `${i}dummy${i}azerty${i}`,
            entities: [],
            metadata: { canonical: true, language },
            intent: `dumdum${i}`,
        });
    }

    entity_synonyms = entity_synonyms.map(copyAndFilter);
    entity_synonyms = entity_synonyms.map(({
        value: synonym,
        synonyms: examples,
    }) => ({
        synonym,
        examples,
    }));

    fuzzy_gazette = fuzzy_gazette.map(copyAndFilter);
    fuzzy_gazette = fuzzy_gazette.map(({
        value: gazette,
        gazette: examples,
    }) => ({
        gazette,
        examples,
    }));

    common_examples = common_examples.map(
        ({
            text, intent, entities = [], metadata: { canonical, ...metadata } = {},
        }) => ({
            intent,
            examples: [{ text: processExportNluExampleEntities(text, entities) }],
        }),
    );

    // group examples by intent as in Rasa docs: https://rasa.com/docs/rasa/training-data-format#training-examples
    common_examples = Array.from(common_examples.reduce((m, { intent, examples }) => m.set(intent, [...(m.get(intent) || []), examples[0].text]), new Map()), ([intent, examples]) => ({ intent, examples }));
    const nlu_and_config = {
        nlu: [...common_examples, ...entity_synonyms],
        gazette: fuzzy_gazette,
        // regex_features: regex_features.map(copyAndFilter),
        config: {
            ...yaml.safeLoad(config),
            language,
        },
    };
    return nlu_and_config;
};

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
        auditLog,
    } from '../../../server/logger';
    // eslint-disable-next-line import/order
    import { performance } from 'perf_hooks';

    const trainingAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        async 'rasa.parse'(instance, examples, options = {}) {
            checkIfCan('nlu-data:r', instance.projectId);
            check(instance, Object);
            check(examples, Array);
            check(options, Object);
            const { failSilently } = options;
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.parse',
                Meteor.userId(),
                { instance, examples },
            );
            appMethodLogger.debug('Parsing nlu');
            try {
                const client = await createAxiosForRasa(instance.projectId, { timeout: 100 * 1000 });
                addLoggingInterceptors(client, appMethodLogger);
                // axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
                const requests = examples.map(({ text, lang }) => {
                    const payload = Object.assign({}, { text, lang });
                    return client.post('/model/parse', payload);
                });

                const result = (await axios.all(requests))
                    .filter(r => r.status === 200)
                    .map(r => r.data)
                    .map((r) => {
                        if (!r.text || r.text.startsWith('/')) {
                            return {
                                text: (r.text || '').replace(/^\//, ''),
                                intent: null,
                                intent_ranking: [],
                                entities: [],
                            };
                        }
                        return r;
                    });
                if (result.length < 1 && !failSilently) {
                    throw new Meteor.Error('Error when parsing NLU');
                }
                if (
                    Array.from(new Set(result.map(r => r.language))).length > 1
                    && !failSilently
                ) {
                    throw new Meteor.Error(
                        'Tried to parse for more than one language at a time.',
                    );
                }
                return examples.length < 2 ? result[0] : result;
            } catch (e) {
                if (failSilently) {
                    const result = examples.map(({ text }) => ({
                        text: (text || '').replace(/^\//, ''),
                        intent: null,
                        intent_ranking: [],
                        entities: [],
                    }));
                    return examples.length < 2 ? result[0] : result;
                }
                throw formatError(e);
            }
        },

        async 'rasa.getTrainingPayload'(
            projectId,
            { language = '', env = 'development' } = {},
        ) {
            checkIfCan(['nlu-data:x', 'projects:r', 'export:x'], projectId);
            check(projectId, String);
            check(language, String);

            const { policies: corePolicies, augmentationFactor } = CorePolicies.findOne(
                { projectId },
                { policies: 1, augmentationFactor: 1 },
            );
            const nlu = {};
            const config = {};
            const gazette = {};

            const {
                stories = [], rules = [], domain, wasPartial,
            } = await getFragmentsAndDomain(
                projectId,
                language,
                env,
            );
            stories.sort((a, b) => a.story.localeCompare(b.story));
            rules.sort((a, b) => a.rule.localeCompare(b.rule));
            const selectedIntents = wasPartial
                ? yaml.safeLoad(domain).intents
                : undefined;
            let languages = [language];
            if (!language) {
                const project = Projects.findOne({ _id: projectId }, { languages: 1 });
                languages = project ? project.languages : [];
            }

            const nlu_multi = [];
            let config_multi;
            for (const lang of languages) {
                const nlu_and_config = await getNluDataAndConfig(projectId, lang, selectedIntents);
                nlu[lang] = nlu_and_config.nlu;
                gazette[lang] = nlu_and_config.gazette;

                config[lang] = {
                    ...nlu_and_config.config,
                    ...yaml.safeLoad(corePolicies),
                };
                nlu_multi.push(...nlu[lang]);
                if (config[lang].multi_language_config) {
                    config_multi = config[lang];
                }
            }

            /* For nlu and config, we return here all languages separately (nlu, config) and
            possible multi_config version (nlu_multi, config_multi), because this function
            is called for several purposes: rasa training, git integration, project export.
            The caller can then decide which parts to use. */
            const payload = {
                domain,
                stories,
                rules,
                nlu,
                config,
                gazette,
                nlu_multi,
                config_multi,
                languages,
                // fixed_model_name: getProjectModelFileName(projectId),
                // augmentation_factor: augmentationFactor,
            };

            auditLog('Retreived training payload for project', {
                user: Meteor.user(),
                type: 'execute',
                projectId,
                operation: 'nlu-model-execute',
                resId: projectId,
                resType: 'nlu-model',
            });
            return payload;
        },

        async 'rasa.train'(projectId, env = 'development') {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            auditLog('Trained project', {
                user: Meteor.user(),
                projectId,
                type: 'execute',
                operation: 'nlu-model-trained',
                resId: projectId,
                resType: 'nlu-model',
            });
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.train',
                Meteor.userId(),
                { projectId },
            );

            appMethodLogger.debug(`Training project ${projectId}...`);
            const t0 = performance.now();
            try {
                const payload = await Meteor.call('rasa.getTrainingPayload', projectId, { env });

                // Currently (21.10.2021) Rasa's model/train endpoint expects
                // all data in single yaml structure without seperate 'domain'
                // and 'config' blocks:
                // https://forum.rasa.com/t/rasa-2-0-api-model-train-doesnt-work/35923/6
                const config = payload.config_multi ? payload.config_multi : payload.config[payload.languages[0]];
                const rasa_payload = {
                    ...payload.domain,
                    nlu: payload.config_multi ? payload.nlu_multi : payload.nlu[payload.languages[0]],
                    rules: payload.rules,
                    ...config,
                    stories: payload.stories,
                    gazette: Object.values(payload.gazette), // atm shelf-rasa only supports one language
                };

                // AAIC-323 3.3.2022: Rasa fails to process entities in story steps correctly, if
                // the step contains both entities and "user" field. Thus, we remove the user field
                // from steps that contain entities.
                removeUserFromEntitySteps(rasa_payload.stories);
                removeUserFromEntitySteps(rasa_payload.rules);

                // Form restructuring start:
                // Form definition in domain updated to support current version of Rasa 2.8
                // We stack slots under required_slots

                const required_slots = {};

                // Helper functions
                // 1) function that copies slot type under slot root.
                function addType(data) {
                    if (data.type == 'from_entity') {
                        return { type: data.type, entity: data.entity[0] };
                    } if (data.type == 'from_intent') {
                        return { type: data.type, intent: [], value: [] };
                    }
                    return { type: data.type };
                }

                // 2) function which unlists list items to dict.
                function unlistItems(item) {
                    const new_elements = [];
                    item.forEach((element) => {
                        const new_element = {};
                        for (const key in element) {
                            if (Array.isArray(element[key])) {
                                if (element[key].length > 0) {
                                    // keep element key value if it is not an empty list
                                    new_element[key] = element[key][0];
                                }
                            } else {
                                new_element[key] = element[key];
                            }
                        }
                        new_elements.push(new_element);
                    });
                    return new_elements;
                }

                // 3) function which reorders botfronts slot content into a shelf-rasa compatible form.
                function toRequiredSlots(slots) {
                    const required_slots = {};
                    slots.forEach((element) => {
                        typedict = addType(element.filling[0]);
                        
                        for (const key in typedict) {
                            element[key] = typedict[key];
                        }
                        // unlist all items (intent,not_intent,type,entity,role,group,value)
                        element.filling = unlistItems(element.filling);
                        required_slots[element.name] = [element];
                    });
                    
                    return required_slots;
                }

                const reformatted_form = {};

                // Main loop for restructuring Forms. Process each form in the domain with helper functions.
                for (const key in payload.domain.forms) {
                    reformatted_form[key] = {};
                    for (const formkey in payload.domain.forms[key]) {
                        if (formkey == 'slots') {
                            slots_record = toRequiredSlots(payload.domain.forms[key][formkey]);
                            reformatted_form[key].required_slots = slots_record;
                        } else {
                            other_record = payload.domain.forms[key][formkey];
                            reformatted_form[key][formkey] = other_record;
                        }
                    }
                }
                
                rasa_payload.forms = reformatted_form;
                
                // Form restructuring ends.


                // TODO: what are fragments in rasa-for-botfront? Official rasa
                // doesn't recognize these.
                /*
                payload.fragments = yaml.safeDump(
                    { stories, rules },
                    { skipInvalid: true },
                );
                payload.load_model_after = true;
                */

                const trainingClient = await createAxiosForRasa(projectId,
                    { timeout: process.env.TRAINING_TIMEOUT || 0, responseType: 'arraybuffer' });

                addLoggingInterceptors(trainingClient, appMethodLogger);

                // hack to add '|' to end of 'examples:' yaml as in Rasa docs: https://rasa.com/docs/rasa/training-data-format#training-examples
                // this could be done some better way in js-yaml library but didn't yet figure out how
                const trainingResponse = await trainingClient.post(
                    '/model/train',
                    yaml.safeDump(rasa_payload, { skipInvalid: true, lineWidth: -1 }).replace(new RegExp('examples:', 'g'), 'examples: |'),
                    { headers: { 'Content-type': 'application/x-yaml' } },
                );
                if (trainingResponse.status === 200) {
                    // Activate trained model (former approach loaded model in rasa model/train,
                    // but aurora tries to keep rasa intact and make changes to botfront instead.)
                    
                    const activateModelResponse = await trainingClient.put(
                        '/model',
                        { model_file: `models/${trainingResponse.headers.filename}` },
                        { headers: { 'Content-type': 'application/json' } },
                    );

                    if (activateModelResponse.status === 204) {
                        const t1 = performance.now();
                        appMethodLogger.debug(
                            `Training project ${projectId} - ${(t1 - t0).toFixed(2)} ms`,
                        );
                        Meteor.call('call.postTraining', projectId, trainingResponse.data);
                        Activity.update(
                            { projectId, validated: true },
                            { $set: { validated: false } },
                            { multi: true },
                        ).exec();
                    }
                }

                Meteor.call('project.markTrainingStopped', projectId, 'success');
            } catch (e) {
                console.log(e); // eslint-disable-line no-console
                const error = `${e.message || e.reason} ${(
                    e.stack.split('\n')[2] || ''
                ).trim()}`;
                const t1 = performance.now();
                appMethodLogger.error(
                    `Training project ${projectId} - ${(t1 - t0).toFixed(2)} ms`,
                    { error },
                );
                Meteor.call('project.markTrainingStopped', projectId, 'failure', error);
                throw formatError(e);
            }
        },

        async 'rasa.evaluate.nlu'(projectId, language, testData) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            check(language, String);
            check(testData, Match.Maybe(Object));
            auditLog('Evaluated nlu data', {
                user: Meteor.user(),
                projectId,
                type: 'execute',
                operation: 'nlu-model-evaluate',
                resId: projectId,
                resType: 'nlu-model',
            });
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.evaluate.nlu',
                Meteor.userId(),
                { projectId, language, testData },
            );
            try {
                this.unblock();
                const examples = testData || {
                    rasa_nlu_data: (await getNluDataAndConfig(projectId, language))
                        .rasa_nlu_data,
                };
                const client = await createAxiosForRasa(projectId, { timeout: 60 * 60 * 1000 }, { language });
                addLoggingInterceptors(client, appMethodLogger);
                axiosRetry(client, {
                    retries: 3,
                    retryDelay: axiosRetry.exponentialDelay,
                });
                let results = Promise.await(client.post('/model/test/intents', examples));

                results = replaceMongoReservedChars({
                    intent_evaluation: results.data.intent_evaluation || {},
                    entity_evaluation:
                        results.data.entity_evaluation.DIETClassifier || {},
                });

                const evaluations = Evaluations.findOne(
                    { projectId, language },
                    { field: { _id: 1 } },
                );
                if (evaluations) {
                    Evaluations.update({ _id: evaluations._id }, { $set: { results } });
                } else {
                    Evaluations.insert({ results, projectId, language });
                }
                return 'ok';
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
