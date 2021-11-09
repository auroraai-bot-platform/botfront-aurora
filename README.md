# Documentation

The [official documentation](https://botfront.io/docs/getting-started/setup) of Botfront is hosted on [botfront.io](https://botfront.io/docs/getting-started/setup). It is automatically built and updated on every new release. Once you've installed the cli you can also use `botfront docs` to open it.

**We welcome contributions!** It can be as easy as clicking on the "Edit page on Github" link at the bottom of every documentation pages.

# Development

### Installation

**!!Development version of Botfront doesn't seem to run on Windows so continue the process below with Linux or Mac!!**

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies:
```bash
git clone git@github.com:auroraai-bot-platform/botfront-private.git
cd botfront/botfront
meteor npm install
```
3. Install the CLI from the source code:
```bash
# if you installed Botfront CLI from npm uninstall it.
npm uninstall -g botfront
# Install the cli from the source code
cd cli && npm link
```
Botfront needs to be connected to other services, especially Rasa. To do this, you need to create a regular project, and start Botfront with a dedicated configuration:

- Create a Botfront project with `botfront init` (somewhere else, not in the repo)
- Start your project with `botfront up -e botfront`. This will run all services except the Botfront app, since you are going to run it with Meteor locally
- Go back to the botfront checkout `cd botfront/botfront` and run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000) so open your browser and happy editing :smile_cat:
- Go to back to the botfront app directory. Open `./.botfront/botfront.yml` and add the correct projectId and change the bf_url. Otherwise the rasa instance cannot
connect to botfront.
```shell
bf_project_id: '<PROJECT-ID>'
bf_url: 'http://host.docker.internal:3000/graphql'
```
- If on Linux go open `docker-compose-template.yml` and add to the rasa service definition to give access to the host
```shell
extra_hosts:
      - "host.docker.internal:host-gateway"
```
    
### TroubleShooting

Some [botfront cli](https://github.com/botfront/botfront/blob/master/cli/src/cli.js) commands that may help if you run into problems:

```shell
botfront init     # create a new botfront project
botfront logs     # show the logs!
botfront killall  # stop all docker services
botfront down     # stop all botfront services
botfront up       # restart botfront
botfront docs     # open the docs in your browser
```

Note that these should be run from the same directory as your botfront project

### Contribute

We ❤️ contributions of all size and sorts. If you find a typo, if you want to improve a section of the documentation or if you want to help with a bug or a feature, here are the steps:

1. Fork the repo and create a new branch, say `fix-botfront-typo-1`
2. Fix/improve the codebase
3. Commit the changes. **Commit message must follow [the naming convention](#commit-messages-naming-convention)**, say `fix(conversation builder): display story groups in alphabetical order`
4. Make a pull request. **Pull request name must follow [the naming convention](#commit-messages-naming-convention)**. It can simply be one of your commit messages, just copy paste it, e.g. `fix(readme): improve the readability and move sections`
5. Submit your pull request and wait for all checks passed (up to an hour)
6. Request reviews from one of the developers from our core team.
7. Get a 👍 and PR gets merged.

Well done! Once a PR gets merged, here are the things happened next:
- all Docker images tagged with `branch-master` will be automatically updated in an hour. You may check the status on the [Actions](https://github.com/botfront/botfront/actions) tab.
- your contribution and commits will be included in [our release note](https://github.com/botfront/botfront/blob/master/CHANGELOG.md).

### Commit messages naming convention

To help everyone with understanding the commit history of Botfront, we employ [`commitlint`](https://commitlint.js.org/#/) to enforce the commit styles:

```text
type(scope?): subject
```

where `type` is one of the following:

- build
- ci
- chore
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

`scope` is optional, represents the module your commit working on.

`subject` explains the commit.

As an example, a commit that improved the documentation:
```text
docs(conversation builder): update slots manager screenshot.
```

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
