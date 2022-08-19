describe('Project instances', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
        cy.visit('/project/bf/settings')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('edit already created instances', () => {
        cy.contains('Instance').click()
        cy.get('[data-cy=save-instance]').click()
        cy.get('.s-alert-success').should('be.visible')
    })

    it('edit instance token', () => {
        cy.contains('Instance').click()
        cy.dataCy('token-field').find('input').type('testtoken')
        cy.get('[data-cy=save-instance]').click()
        cy.get('.s-alert-success').should('be.visible')
        cy.dataCy('token-field').find('input').should('have.value', 'testtoken')
    })
})
