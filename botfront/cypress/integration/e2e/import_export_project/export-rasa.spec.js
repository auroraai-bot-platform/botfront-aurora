describe('Export project', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
        cy.waitForResolve(Cypress.env('RASA_URL'))
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`)
        cy.visit('/project/bf/settings/import-export')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('navigate the UI for exporting to Rasa/Botfront', () => {
        cy.dataCy('port-project-menu').find('.item').contains('Export').click()
        cy.dataCy('export-language-dropdown').click().find('span').first().click()
        cy.dataCy('export-button').click()
        cy.contains('Your project has been successfully exported').should('exist')
    })

    it('list project languages in the language dropdown', () => {
        // French should be available
        // English should not be available
        cy.dataCy('port-project-menu').find('.item').contains('Export').click()
        cy.dataCy('export-language-dropdown').click().find('span').contains('French').should('exist')
        cy.dataCy('export-language-dropdown').click().find('span').contains('English').should('not.exist')
            
        // add english to the project langauges
        cy.visit('/project/bf/settings/info')
        cy.dataCy('language-selector').click().find('span').contains('English').click()
        cy.dataCy('save-changes').click({ force: true })
        cy.dataCy('save-changes').should('not.have.class', 'disabled')
        
        // english and french should be available
        cy.contains('Endpoints').click()
        cy.dataCy('endpoints-environment-menu').should('exist')
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').find('.item').contains('Export').click()
        cy.dataCy('export-language-dropdown').click().find('span').contains('French').should('exist')
        cy.dataCy('export-language-dropdown').click().find('span').contains('English').should('exist')
    })
})
