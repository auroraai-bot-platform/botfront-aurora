const newFormName = 'Groupo_1_form'

const addextractionFromMessage = (slot) => {
    cy.dataCy(`slot-node-${slot}`).click()
    cy.dataCy('form-top-menu-item').contains('Extraction').click()
    cy.dataCy('extraction-source-dropdown').click()
    cy.dataCy('extraction-source-dropdown').find('span.text').contains('from the user message').click()
    cy.dataCy('extraction-source-dropdown').find('div.text').should('have.text', 'from the user message')
}

describe('Form usage', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('project/bf/dialogue')
    })

    afterEach(() => {
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`)
        cy.deleteProject('bf')
    })

    it('create a form, use it and view the result', () => {        
        cy.meteorAddSlot('bool_slot', 'bool')
        cy.createStoryGroup()
        cy.createFragmentInGroup({ type: 'form' })
        cy.createFragmentInGroup({ type: 'form' })
        cy.selectForm(newFormName)

        cy.dataCy('start-node').click()
        cy.dataCy('side-questions').click()
        cy.dataCy('form-collection-togglefield').click()
        cy.dataCy('toggled-true').should('exist')

        cy.addSlotNode('1', 'slot1')

        addextractionFromMessage('slot1')

        cy.addSlotSetNode('slot1', 'bool', 'bool_slot', 'true')

        cy.dataCy('add-node-slot1').should('have.class', 'disabled')

        cy.get('.if-button').last().click()

        cy.dataCy('condition-modal').contains('Add rule').click()
        cy.dataCy('condition-modal').contains('Select field').click()
        cy.dataCy('condition-modal').find('.dropdown .item').contains('slot1').click()
        cy.dataCy('condition-modal').find('.rule--body input').eq(2).type('oui')
        cy.get('.ui.modals.dimmer').click('topLeft')

        cy.dataCy('add-node-slot1').should('not.have.class', 'disabled')
        cy.addSlotSetNode('slot1', 'bool', 'bool_slot', 'false')
        cy.dataCy('slot-set-node').should('have.length', 2)
        cy.createFragmentInGroup({ fragmentName: 'testStory' })
        cy.addUtteranceLine({ intent: 'trigger_form' })
        cy.dataCy('add-loop-line').click({ force: true })
        cy.dataCy('activate-loop').click({ force: true })
        cy.dataCy('loop-selection-menu').find('span.text').contains(newFormName).click({ force: true })
        cy.get('.story-line').should('have.length', 2)
        cy.dataCy('no-active-loop').last().click({ force: true })
        cy.get('.story-line').should('have.length', 3)

        cy.dataCy('create-branch').click()

        cy.get('.story-line').should('have.length', 3)
        cy.dataCy('add-slot-line').should('have.length', 2)
        cy.dataCy('value-bool_slot-true').last().click({ force: true })
        cy.get('.story-line').should('have.length', 4)
        cy.dataCy('from-text-template').last().click({ force: true })
        cy.dataCy('bot-response-input').find('textarea').click()
        cy.dataCy('bot-response-input').find('textarea').type('path A {bool_slot}', { parseSpecialCharSequences: false })
        cy.get('.story-line').should('have.length', 5)

        cy.dataCy('branch-label').last().click()
        cy.get('.label-container.orange').should('not.exist')

        cy.get('.story-line').should('have.length', 3)
        cy.dataCy('add-slot-line').should('have.length', 2)
        cy.dataCy('value-bool_slot-false').last().click({ force: true })
        cy.get('.story-line').should('have.length', 4)
        cy.dataCy('from-text-template').last().click({ force: true })
        cy.dataCy('bot-response-input').last().find('textarea').click()
        cy.dataCy('bot-response-input').last().find('textarea').type('path B {bool_slot}', { parseSpecialCharSequences: false })
        cy.get('.story-line').should('have.length', 5)
        cy.dataCy('branch-label').last().click()

        cy.train()
        cy.newChatSesh()
        cy.contains('utter_get_started')
        cy.testChatInput('/trigger_form', 'utter_ask_slot1')
        cy.testChatInput('oui', 'path A true')

        cy.newChatSesh()
        cy.contains('utter_get_started')
        cy.testChatInput('/trigger_form', 'utter_ask_slot1')
        cy.testChatInput('non', 'Path B')

        cy.dataCy('incoming-sidebar-link').click({ force: true })
        cy.dataCy('forms').click()
        cy.get('.ui.header').should('include.text', newFormName)
        cy.dataCy('export-form-submissions').eq(0).should('include.text', 'Export 2 submissions to CSV format').click()
        cy.getWindowMethod('getCsvData').then((getCsvData) => {
            const csvData = getCsvData().split('\n')[1].split(',')
            expect(csvData).to.have.lengthOf(7)
            expect(csvData).to.include('"non"')
        })
    })
})
