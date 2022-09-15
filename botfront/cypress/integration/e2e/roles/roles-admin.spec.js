describe('Roles permissions', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.createDummyRoleAndUser({ permission: ['roles:r'] })
    })

    beforeEach(() => {
        cy.login({ admin: false })
        cy.visit('/admin/roles')
    })

    after(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('creating new response should not be possible', () => {
        cy.dataCy('create-role').should('not.exist')
    })

    it('see list of all roles', () => {
        cy.get('div.rt-td a').should('have.length', 20)
        cy.get('div.-next button.-btn').click()
        cy.get('div.rt-td a').should('have.length', 12) // 11 base roles + 1 dummy role
        cy.visit('/admin/roles')
    })

    it('see details of a role', () => {
        cy.get('div.-next button.-btn').click()
        cy.contains('dummy').click()
        cy.get('div.required.field').each(elm => cy.wrap(elm).should('have.class', 'disabled'))
        cy.dataCy('save-button').should('not.exist')
        cy.dataCy('delete-role').should('not.exist')
    })
})
