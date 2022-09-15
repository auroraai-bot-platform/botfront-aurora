describe('Users:r can not edit user data', () => {
    beforeEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('showing edit features in the users page should not be possible', () => {
        cy.createDummyRoleAndUser({ permission: ['users:r'] })
        cy.login({ admin: false })
        cy.visit('/admin')
        cy.dataCy('users-link').click({ force: true })
        cy.dataCy('edit-user').first().click()
        cy.get('.disabled.required.field').should('have.length', 6) // check ALL fields are disabled
        cy.dataCy('save-user').should('not.exist')
        cy.get('.ui.pointing.secondary.menu').children().should('have.length', 1) // Change password and Delete user should be hidden
    })

    it('the "Users" link is hidden in the admin sidebar when the user does not have users:r permission', () => {
        cy.createDummyRoleAndUser({ permission: ['projects:w'] })
        cy.login({ admin: false })
        cy.visit('/admin')
        cy.dataCy('users-link').should('not.exist')
    })

})
