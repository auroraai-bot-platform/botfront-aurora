describe('Incoming:r restricted permissions', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.setTimezoneOffset()
        cy.addConversationFromTemplate('bf', 'default', 'dev1', { language: 'en' })
        cy.createDummyRoleAndUser({ permission: ['incoming:r'] })
    })

    beforeEach(() => {
        cy.login({ admin: false })
        cy.visit('/project/bf/incoming/')
    })

    after(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('should not show the delete and move buttons in activity', () => {
        cy.dataCy('intent-label').should('exist').should('have.class', 'uneditable')
        cy.dataCy('icon-sign-out').should('not.exist')
        cy.dataCy('trash').should('not.exist')
    })

    it('should not show the delete conversation button', () => {
        cy.dataCy('conversations').click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('conversation-delete').should('not.exist')
    })

    it('should not show populate tab', () => {
        cy.dataCy('populate').should('not.exist')
    })
})
