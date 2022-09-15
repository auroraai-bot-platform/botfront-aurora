describe('Permission on the trigger rules modal', () => {
    beforeEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    afterEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('editing triggers should not be possible', () => {
        cy.createDummyRoleAndUser({ permission: ['triggers:r'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/dialogue')
        cy.browseToStory('Get started')
        cy.dataCy('edit-trigger-rules').click()
        cy.get('div.modal div.grouped.fields').should('have.class', 'disabled')
        cy.dataCy('delete-triggers').should('not.exist')
        cy.dataCy('submit-triggers').should('not.exist')
    })
})
