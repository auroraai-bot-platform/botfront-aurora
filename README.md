# AuroraAI Botfront

*AuroraAI fork of Botfront, an open-source platform for developing
chatbots.*

## Background

Botfront is an open-source platform for developing Rasa-based
chatbots. The original Botfront was developed and maintained in Github
repository [botfront/botfront](https://github.com/botfront/botfront)
by the Botfront team until Botfront was acquired in spring 2021 and in
may 2021 the original Github repository was archived. Since further
changes to the repository were not possible anymore, we have forked
the Botfront repository and continued development.

The objectives of our Botfront fork are:
* Enable newer versions of Rasa to be supported by Botfront
* Add some functionalities needed by the AuroraAI programme

**Note!** Botfront is not directly compatible with the official Rasa
version, but small changes have been required to Rasa too. The
supported version of Rasa is maintained in the Github repo
[auroraai-bot-platform/rasa](https://github.com/auroraai-bot-platform/rasa).

## AuroraAI Programme

AuroraAI is a Finnish artificial intelligence programme coordinated by
the Ministry of Finance. The aim of the programme is to offer citizens
personalised services at the right time in different life situations
and events.

More information about the AuroraAI programme:
* [AuroraAI national artificial intelligence programme, DigiFinland](https://digifinland.fi/en/our-operations/aurora-ai-national-artificial-intelligence-programme/)
* [National Artificial Intelligence Programme AuroraAI, Ministry of Finance Finland](https://vm.fi/en/national-artificial-intelligence-programme-auroraai)

## Installation

AuroraAI Botfront is part of chatbot platform
[auroraai-bot-platform/platform](https://github.com/auroraai-bot-platform/platform). See
the platform documentation for the detailed instructions for
* Running the platform
* Putting up a development environment
* Contributing to the project

## Testing

## Unit & Integration Testing
Unit tests are running through the meteor mocha package `meteortesting:mocha`.
Tests should be stored in `*.test.js` files beside the source code js files.

### Installation
* run `npm ci` to install the dependencies

### Run all tests
This will take a while
* run `npm run test-once`

### Run only tests related to the REST API
This will run all tests, which contain `REST:` within the description
* run `npm run test-rest`

## E2E Testing
End to end tests are using the Cypress testing framework.
The first test case `01_initial_setup_dont_change_name/initial_setup.spec.js` drops the mongo database on startup and creates own test user.
The test user is necessary to run the e2e tests.

```shell
email: test@test.com
password: aaaaaaaa00
```

### Installation
* install `mongo` client as the first testcase will drop the whole database via the mongo client
* run `meteor npm install` inside `botfront/cypress` to install the cypress plugins

### Run all tests
* run `meteor npm run start:docker-compose.dev` to run botfront in dev mode
* run `meteor npx cypress run`

### Run single test file with existing database
* create the aforementioned test user inside the system
* run `npx cypress run --spec cypress/<path_to_spec.js>`

### Run single test file with a clean database
* run `npx cypress run --spec cypress/integration/01_initial_setup_dont_change_name/initial_setup.spec.js` to drop the database and create test user one time
* run `npx cypress run --spec cypress/<path_to_spec.js>`

### Run tests from the Cypress UI
* create the test user via hand or via the first test case
* run `npx cypress open

**Some tests also require Rasa to be available.**

<br/>

# License

Copyright (C) 2021 Dialogue Technologies Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.(C) 2021 Dialogue Technologies Inc. All rights reserved.
