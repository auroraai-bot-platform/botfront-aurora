/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { getNluDataAndConfig, removeUserFromEntitySteps } from './instances.methods';
import { Projects } from '../project/project.collection';
import { createTestUser } from '../testUtils';
// eslint-disable-next-line import/named
import { setUpRoles } from '../roles/roles';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from './instances.collection';
import { createAxiosForRasa } from '../../lib/utils';
import { insertExamples } from '../graphql/examples/mongo/examples';
import Examples from '../graphql/examples/examples.model';
import { off } from 'process';

const nluModel = {
    _id: 'test_model',
    projectId: 'test',
    name: 'chitchat-en',
    language: 'en',
    config:
        'pipeline:\n  - name: WhitespaceTokenizer\n  - name: LexicalSyntacticFeaturizer\n  - name: CountVectorsFeaturizer\n  - name: CountVectorsFeaturizer\n    analyzer: char_wb\n    min_ngram: 1\n    max_ngram: 4\n  - name: DIETClassifier\n    epochs: 100\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: >-\n      rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: 'd513ca5e-27d8-4911-814a-37247765bcf5',
                text: 'tt',
                intent: 'chitchat.tell_me_a_joke',
                entities: [],
                updatedAt: {
                    $date: '2020-07-17T20:08:45.208Z',
                },
            },
            {
                text: 'that\'s all goodbye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'd0f21d0e-f91e-46f1-a6e5-c2a51dead671',
                updatedAt: {
                    $date: '2020-07-17T14:30:53.998Z',
                },
            },
            {
                text: 'hello good evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: '6bf308c2-15c3-4168-a05e-0ab3905360b4',
                updatedAt: {
                    $date: '2020-07-17T14:30:54.089Z',
                },
            },
        ],
        entity_synonyms: [
            {
                value: 'NYC',
                synonyms: ['New-York', 'the big apple'],
                _id: 'd390acad-18d6-4705-99b0-77b764525536',
            },
        ],
        regex_features: [],
        fuzzy_gazette: [],
    },
    updatedAt: {
        $date: '2020-07-17T20:08:45.207Z',
    },
};

const allExamples = [
    {
        intent: 'chitchat.bye',
        examples: ["that's all goodbye"]
    },
    {
        intent: 'chitchat.greet',
        examples: ['hello good evening']
    },
    {
        intent: 'chitchat.tell_me_a_joke',
        examples: ['tt']
    },
    {
        examples: ['New-York', 'the big apple'],
        synonym: 'NYC'
    }
];

const testProject = {
    _id: 'test',
    namespace: 'bf-test',
    name: 'My Project',
    defaultLanguage: 'en',
    languages: ['en'],
    defaultDomain: {
        content:
            'slots:\n  disambiguation_message:\n    type: any\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
    },
    enableSharing: false,
    disabled: false,
    updatedAt: { $date: '2020-07-24T13:51:26.698Z' },
    storyGroups: ['r4xYPj8w6MgkwjQTm'],
    training: { instanceStatus: 'notTraining' },
};

const selectedExamples = [
    { intent: 'chitchat.bye', examples: ["that's all goodbye"] },
    { intent: 'chitchat.greet', examples: [ 'hello good evening' ] },
    { synonym: 'NYC', examples: [ 'New-York', 'the big apple' ] }
];
const selectedExampleAndDummy = [
    { intent: 'chitchat.greet', examples: [ 'hello good evening' ] },   
    { intent: 'dumdum0', examples: [ '0dummy0azerty0' ] },
    { synonym: 'NYC', examples: [ 'New-York', 'the big apple' ] }
];

if (Meteor.isTest) {

    describe('removeUserFromEntitySteps', function () {
        this.timeout(15000);
        it('should remove user field from steps with entities', async function () {
            const stories = [
                { 
                    story: 'story 1',
                    steps: [
                        {
                            intent: 'greet',
                            user: 'hello hello from Tampere',
                            entities: [ { city: 'Tampere' } ]
                        },
                        { action: 'utter_greet' },
                        {
                            intent: 'bye',
                            user: 'bye bye',
                            entities: []
                        }
                    ],
                    story: 'story 2',
                    steps: [
                        {
                            intent: 'greet',
                            user: 'hello hello from Oulu',
                            entities: [ { city: 'Oulu' } ]
                        },
                        { action: 'utter_greet' },
                        {
                            intent: 'bye',
                            user: 'bye bye',
                            entities: []
                        }
                    ]
                }
            ];

            const stories_expected = [
                { 
                    story: 'story 1',
                    steps: [
                        {
                            intent: 'greet',
                            entities: [ { city: 'Tampere' } ]
                        },
                        { action: 'utter_greet' },
                        {
                            intent: 'bye',
                            user: 'bye bye',
                            entities: []
                        }
                    ],
                    story: 'story 2',
                    steps: [
                        {
                            intent: 'greet',
                            entities: [ { city: 'Oulu' } ]
                        },
                        { action: 'utter_greet' },
                        {
                            intent: 'bye',
                            user: 'bye bye',
                            entities: []
                        }
                    ]
                }
            ];

            removeUserFromEntitySteps(stories)
            expect(stories).to.deep.equal(stories_expected);
        });
    });

    describe('getNluDataAndConfig', function () {
        this.timeout(15000);
        if (Meteor.isServer) {
            before(async (done) => {
                setUpRoles();
                await createTestUser();
                await Projects.insert(testProject);
                await NLUModels.insert(nluModel);
                await insertExamples({
                    language: 'en',
                    projectId: 'test',
                    examples: nluModel.training_data.common_examples,
                });
                done();
            });
            after(async (done) => {
                await Projects.remove({ _id: 'test' });
                await NLUModels.remove({ projectId: 'test' });
                await Examples.deleteMany({ projectId: 'test' }).exec();
                done();
            });

            it('should generate a payload with all the nlu when there are no selected intents', async function () {
                const data = await getNluDataAndConfig('test', 'en')
                expect(data.nlu).to.deep.equal(allExamples);
            });

            it('should generate a payload with only selected the nlu when there are selected intents', async function () {
                const data = await getNluDataAndConfig('test', 'en', [
                    'chitchat.greet',
                    'chitchat.bye',
                ]);
                expect(data.nlu).to.deep.equal(selectedExamples);
            });

            it('should generate a payload with only one selected intent and a dummy one ', async function () {
                const data = await getNluDataAndConfig('test', 'en', ['chitchat.greet']);
                const util = require('util');
                console.log(util.inspect(data.nlu, {showHidden: false, depth: null, colors: true}));
                console.log("---"); 
                console.log(selectedExampleAndDummy);
                expect(data.nlu).to.deep.equal(selectedExampleAndDummy);
            });
        }
    });

   
    describe('createAxiosForRasa', function () {
        this.timeout(15000);
        if (Meteor.isServer) {
            before(async (done) => {
                await Instances.insert({ projectId: 'bf', host: 'http://test.host', token: 'abc' });
                done();
            });
            after(async (done) => {
                await Instances.remove({ projectId: 'bf' });
                done();
            });
    
            it('should create an axios client with the right config to call rasa', async function () {
                const client = await createAxiosForRasa('bf');
                expect(client.defaults.baseURL).to.equal('http://test.host');
                expect(client.defaults.params.token).to.equal('abc');
            });
        }
    });
}
