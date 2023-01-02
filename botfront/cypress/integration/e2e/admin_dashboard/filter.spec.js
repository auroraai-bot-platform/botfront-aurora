describe('Filter projects and users', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    it('Filter project', () => {
        cy.visit('/admin/projects')
        cy.get('.rt-tr > :nth-child(1) > input').click().type('My')
        cy.contains('My Project').should('exist')
    })

    it('Filter user', () => {
        cy.login()
        cy.visit('/admin/users')
        cy.get('.rt-tr > :nth-child(1) > input').click().type('mc')
        cy.contains('McTest').should('exist')
        cy.get('.rt-tr > :nth-child(2) > input').click().clear().type('mc')
        cy.contains('McTest').should('not.exist')
        cy.get('.rt-tr > :nth-child(2) > input').click().clear()
        cy.get('.rt-tr > :nth-child(3) > input').click().type('test')
        cy.contains('McTest').should('exist')
    })
})
