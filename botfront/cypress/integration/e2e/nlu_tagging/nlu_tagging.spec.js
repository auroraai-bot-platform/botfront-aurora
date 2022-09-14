describe('NLU tagging in training data', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
        cy.import('bf', 'nlu_import.json', 'fr')
        cy.visit('/project/bf/nlu/models')
        })

    afterEach(() => {
        cy.deleteProject('bf')
    })
    
    it('change the intent with a popup', () => {
        cy.get('.row:contains(chitchat.presentation)').eq(0).findCy('intent-label').click({ force: true }).type('chitchat.tell_me_a_joke{enter}')
        cy.get('.row:contains(chitchat.tell_me_a_joke)')
    })

    it('delete the training data', () => {
        cy.get('.row:contains(chitchat.presentation)').eq(0).findCy('icon-trash').click({ force: true })
        cy.get('.row:contains(chitchat.presentation)').should('have.length', 1)
    })

    it('change an entity with a popup', () => {
        cy.get('.row:contains(chitchat.presentation)').eq(0).findCy('entity-label').click()
        cy.dataCy('entity-dropdown').find('input').type('person{enter}')
        cy.get('.row:contains(person)')
    })

    it('remove the draft status on the example', () => {
        cy.addExamples(['testa', 'testb'])
        cy.get('.row').eq(0).click().should('have.class', 'selected')
        cy.get('body').type('{shift}', { release: false })
        cy.get('.row').eq(1).click()
        cy.get('.row.selected').should('have.length', 2)
        cy.get('body').type('{shift}')
        cy.changeIntentOfSelectedUtterances('test_intent')
        cy.get('.virtual-table').focus()
        cy.dataCy('draft-button').should('have.length', 2)
        cy.get('body').type('s')
        cy.get('@texts').then((texts) => { if (texts.length > 1) cy.yesToConfirmation() })
        cy.dataCy('draft-button').should('not.exist')
    })
})
