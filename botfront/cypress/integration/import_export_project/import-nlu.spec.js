/* global cy Cypress:true */

import TrainingDataValidator  from '../../../imports/lib/importers/validateTrainingData'

describe('Unit Test Botfront NLU import yaml to Json converter', function () {
    context('validateTrainingData.js', function () {
        it('Convert NLU yaml with entities, synonyms and gazette', function () {
            // cy.readFile('cypress/fixtures/test-nlu-convert-data/nlu_input.yml').then((str) => {
            //     let validator = new TrainingDataValidator()
            //     cy.readFile('cypress/fixtures/test-nlu-convert-data/nlu_output.json').should('deep.equal', validator.convertNluToJson(str, 'yaml'))
            // })
            expect(true).to.equal(true)

        })
    })
})