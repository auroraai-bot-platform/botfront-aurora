describe('Project endpoints', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
        cy.visit('/project/bf/settings')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('can be saved', () => {
        cy.contains('Endpoints').click()
        cy.get('[data-cy=save-button]').click()
        cy.get('[data-cy=changes-saved]').should('be.visible')
    })

    it('menu tabs should not be exists with one env', () => {
        cy.contains('Endpoints').click()
        cy.dataCy('endpoints-environment-menu').should('not.have.class', 'menu')
    })

    it('menu tabs should be exists with mutiple env', () => {
        cy.get('[data-cy=deployment-environments]').children().contains('production').click()
        cy.get('[data-cy=save-changes]').click()
        cy.visit('/project/bf/settings')
        cy.contains('Endpoints').click()
        cy.dataCy('endpoints-environment-menu').should('have.class', 'menu')
    })
})
