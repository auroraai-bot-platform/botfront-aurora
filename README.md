# botfront-aurora

Botfront is an application for creating and maintaining rasa-based
chat bots. This repository contains a Botfront version modified to
meed the needs of the AuroraAI programme. The original (currently
archived) Botfront repository is
[botfront/botfront](https://github.com/botfront/botfront).

# Development

This repository is a part of AuroraAI chat bot platform. See
repository
[auroraai-bot-platform/platform](https://github.com/auroraai-bot-platform/platform)
for more information.

# Testing

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
