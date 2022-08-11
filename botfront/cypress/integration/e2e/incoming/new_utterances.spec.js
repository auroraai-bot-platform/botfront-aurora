describe('Incoming page', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.waitForResolve(Cypress.env('RASA_URL'))
        cy.import('bf', 'nlu_sample_en.json', 'en')
        cy.visit('/project/bf/dialogue')
        cy.train()
        cy.addNewUtterances(['apple', 'kiwi', 'banana'])
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('assign populated data to the right language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr')
        cy.import('bf', 'nlu_sample_fr.json', 'fr')
        cy.visit('/project/bf/dialogue')
        cy.train()

        cy.visit('/project/bf/incoming')
        cy.get('.row').should('have.length', 3)
        cy.get('.row').contains('apple').should('exist')
        cy.addNewUtterances(['pomme', 'kiwi', 'banane'], 'French')
        cy.get('.row').should('have.length', 3)
        cy.get('.row').contains('apple').should('not.exist')
        cy.get('.row').contains('pomme').should('exist')
    })

    it('link to evaluation from new utterances', () => {
        cy.dataCy('run-evaluation').should('have.class', 'disabled')
        cy.get('.row').should('have.length', 3)
        cy.selectOrUnselectIncomingRow('banana')
        cy.toggleValidationOfSelectedUtterances()
        cy.dataCy('run-evaluation').should('not.have.class', 'disabled').click()
        cy.yesToConfirmation()
        cy.dataCy('start-evaluation').should('exist')
    })

    it('delete utterances and some to training data', () => {
        cy.dataCy('add-to-training-data').should('have.class', 'disabled')
        cy.get('.row').should('have.length', 3)
        cy.selectOrUnselectIncomingRow('banana')
        cy.deleteSelectedUtterances() // should move focus to next
        cy.get('.row').should('have.length', 2)
        cy.toggleValidationOfSelectedUtterances()
        cy.dataCy('add-to-training-data').should('not.have.class', 'disabled').click()
        cy.yesToConfirmation()
        cy.get('.row').should('have.length', 1)
        cy.visit('/project/bf/nlu/models')
        cy.get('@texts').then((text) => { // saved from toggleValidationOfSelectedUtterances
            cy.contains('.row', text[0]).should('exist')
        })
    })

    it('batch change intent, batch validate, and batch delete', () => {
        cy.selectOrUnselectIncomingRow('apple')
        cy.dataCy('activity-command-bar').should('not.exist')
        cy.selectOrUnselectIncomingRow('banana')
        cy.dataCy('activity-command-bar').should('exist').should('contain.text', '2 selected')
        cy.changeIntentOfSelectedUtterances('fruit')
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2)
        cy.selectOrUnselectIncomingRow('banana')
        cy.selectOrUnselectIncomingRow('kiwi')
        cy.deleteSelectedUtterances()
        cy.get('.row').should('have.length', 1).should('contain.text', 'banana')
    })

    it('view the conversation from the utterance', () => {
        cy.addCustomConversation('bf', 'test', { events: [{ type: 'user', text: 'test conv link' }] })
        cy.visit('/project/bf/incoming')
        cy.get('.utterance-viewer').first().should('have.text', 'test conv link').trigger('mouseover')
        cy.dataCy('conversation-viewer').first().click({ force: true })
        cy.dataCy('conversation-side-panel').should('exist')
        cy.dataCy('conversation-side-panel').should('contains.text', 'test conv link')
    })

    it('move an utterance to OOS, and then to training data', () => {
        cy.get('.row:contains(banana)').findCy('intent-label').find('.action-on-label').click({ force: true })
        cy.get('.null[data-cy=intent-label]').should('exist')
        cy.get('.row:contains(banana)').click({ force: true })
        cy.get('body').type('o')

        cy.visit('/project/bf/nlu/models')
        cy.get('a.item').contains('Out Of Scope').click()
        cy.get('.row:contains(banana)').should('exist')
        cy.dataCy('icon-plus').should('not.exist')
        cy.dataCy('intent-label').find('.content-on-label').click({ force: true })
        cy.get('.popup').should('exist')
        cy.get('.row:contains(greet)').click()
        cy.get('.row:contains(banana)').trigger('mouseover')
        cy.dataCy('icon-plus').should('exist').click({ force: true })
        
        cy.get('a.item').contains('Examples').click()
        cy.get('.row').contains('banana').should('exist')
    })
    
    it('batch validate', () => {
        cy.selectOrUnselectIncomingRow('apple')
        cy.dataCy('activity-command-bar').should('not.exist')
        cy.selectOrUnselectIncomingRow('banana')
        cy.dataCy('activity-command-bar').should('exist').should('contain.text', '2 selected')
        cy.toggleValidationOfSelectedUtterances()
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2)
    })

    it('automatically validate the utterance if there is an intent', () => {
        cy.selectOrUnselectIncomingRow('apple')
        cy.selectOrUnselectIncomingRow('banana')
        cy.changeIntentOfSelectedUtterances('fruit')
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2)
    })

    it('does not validate the utterance automatically when there is no intent', () => {
        cy.selectOrUnselectIncomingRow('apple')
        cy.dataCy('remove-intent').first().click({ force: true })
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 0)
    })
})
