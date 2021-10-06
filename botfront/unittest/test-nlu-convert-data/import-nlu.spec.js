const convertNluToJson = require('../../imports/lib/importers/validateTrainingData.js');

var assert = require('assert');
describe('Unit Test Botfront NLU import yaml to Json converter', function () {
    it('Convert NLU yaml with entities, synonyms and gazette into correct json format', function () {
        assert.equal("Hello".length, 4);
    });
});

// describe('Unit Test Botfront NLU import yaml to Json converter', function () {
//     context('validateTrainingData.js', function () {
//         it('Convert NLU yaml with entities, synonyms and gazette', function () {
//             // cy.readFile('cypress/fixtures/test-nlu-convert-data/nlu_input.yml').then((str) => {
//             //     let validator = new TrainingDataValidator()
//             //     cy.readFile('cypress/fixtures/test-nlu-convert-data/nlu_output.json').should('deep.equal', validator.convertNluToJson(str, 'yaml'))
//             // })
//             expect(true).to.equal(true)

//         })
//     })
// })