describe('Global settings admin sidebar', () => {
    before(() => {
        cy.createDummyRoleAndUser({ permission: ['roles:r'] })
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    beforeEach(() => {
        cy.login({ admin: false })
        cy.visit('/admin')
    })

    after(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })
    
    it('should not be able to access global-settings without global-settings:r', () => {
        cy.dataCy('roles-link').should('exist')
        cy.dataCy('global-settings-link').should('not.exist')
    })
})