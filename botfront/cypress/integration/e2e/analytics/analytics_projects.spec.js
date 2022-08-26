describe('Analytics projects', function () {
    beforeEach(() => {
        // Make sure we have two projects, so we can switch from one to the other
        cy.login()
        cy.deleteProject('bf')
        cy.deleteProject('bf2')
        cy.createProject('bf', 'My Project', 'en')
        cy.createProject('bf2', 'My Second Project', 'en')
        cy.visit('/project/bf/analytics')
    })

    after(() => {
        cy.deleteProject('bf2')
        cy.deleteProject('bf')
    })

    it('Allow switching between projects', () => {      
        cy.dataCy('no-data-message').should('exist')
        cy.get('[data-cy=project-menu] > :nth-child(1) > :nth-child(2) > .ui > :nth-child(3) > :nth-child(2)').scrollIntoView().click({ force: true })
        cy.dataCy('no-data-message').should('exist')
    })
})
