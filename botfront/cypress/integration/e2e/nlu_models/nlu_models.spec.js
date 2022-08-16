describe('NLU Models ', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    beforeEach(() => {
        cy.login()
        cy.visit('/project/bf/settings')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    it('create a new model by adding a new language to the project and then delete it', () => {
        cy.get('[data-cy=language-selector]').click()
        cy.get('[data-cy=language-selector] input').type('French{enter}')
        cy.dataCy('settings-menu').find('.active.item').click()
        cy.get('[data-cy=save-changes]').click()
        cy.get('.s-alert-success').should('be.visible')
        cy.visit('/project/bf/nlu/models')

        // Instance should also be added to the model that is created.
        cy.get('[data-cy=example-text-editor-input]').should('exist')
        cy.get('[data-cy=language-selector]').click()
        cy.get('[data-cy=language-selector] input').type('French{enter}')
        cy.dataCy('nlu-menu-settings').click()
        cy.contains('Delete').click()
        cy.get('.dowload-model-backup-button').click()
        cy.get('.delete-model-button').click()
        cy.get('.ui.page.modals .primary').click()
        cy.get('[data-cy=language-selector]').click({timeout: 5000})
        cy.get('[data-cy=language-selector] input').type('Fre')
        cy.get('[data-cy=language-selector]').contains('French').should('not.exist')
    })

    it('deleting the default model should not be possible', () => {
        cy.get('[data-cy=default-langauge-selection] .ui > .search').click()
        cy.get('[data-cy=default-langauge-selection] input').type('English')
        cy.get('[data-cy=default-langauge-selection]').contains('English').click({ force: true })
        cy.dataCy('settings-menu').find('.active.item').click()
        cy.get('[data-cy=default-langauge-selection]').click()

        // Try to delete the default model
        cy.visit('/project/bf/nlu/models')
        cy.dataCy('nlu-menu-settings').click()
        cy.contains('Delete').click()
        cy.get('.dowload-model-backup-button').click()
        cy.get('.delete-model-button').should('not.exist')
    })
})
