describe('Enable environment', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('enable, edit, and disable production', () => {
        cy.visit('/project/bf/settings')
        cy.get('[data-cy=deployment-environments]').children().contains('production').click()
        cy.get('[data-cy=save-changes]').click()
        cy.contains('Credentials').click()
        cy.dataCy('environment-credentials-tab').contains('Production').click()
        cy.get('[data-cy=ace-field]').click()
        cy.get('textarea').type('# verify saved credentials production')
        cy.get('[data-cy=save-button]').click()

        // verify edit saved
        cy.visit('/project/bf/settings')
        cy.contains('Credentials').click()
        cy.dataCy('environment-credentials-tab').contains('Production').click()
        cy.contains('verify saved credentials production').should('exist')

        cy.contains('Endpoints').click()
        cy.dataCy('environment-endpoints-tab').contains('Production').click()
        cy.get('[data-cy=ace-field]').click()
        cy.get('textarea').type('# verify saved endpoints production')
        cy.get('[data-cy=save-button]').click()

        cy.visit('/project/bf/settings')
        cy.contains('Endpoints').click()
        cy.dataCy('environment-endpoints-tab').contains('Production').click()
        cy.contains('verify saved endpoints production').should('exist')

        cy.visit('/project/bf/settings')
        cy.get('[data-cy=deployment-environments]').children().contains('production').click()
        cy.get('[data-cy=save-changes]').click()
        cy.contains('Credentials').click()
        cy.dataCy('credentials-environment-menu').children().should('not.exist')
        cy.contains('Endpoints').click()
        cy.dataCy('endpoints-environment-menu').children().should('not.exist')
    })
})
