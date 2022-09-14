describe('Project credentials', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    beforeEach(() => {
        cy.login()
        cy.visit('/project/bf/settings')
    })

    it('can be saved', () => {
        cy.contains('Credentials').click()
        cy.get('[data-cy=save-button]').click()
        cy.get('[data-cy=changes-saved]').should('be.visible')
    })

    it('menu tabs should not be exists with one env', () => {
        cy.contains('Credentials').click()
        cy.dataCy('credentials-environment-menu').should('not.have.class', 'menu')
    })

    it('menu tabs should be exists with mutiple env', () => {
        cy.dataCy('deployment-environments').children().contains('production').click()
        cy.dataCy('save-changes').click()
        cy.visit('/project/bf/settings')
        cy.contains('Credentials').click()
        cy.dataCy('credentials-environment-menu').should('have.class', 'menu')
    })
})
