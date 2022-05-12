describe('Login', function() {

    beforeEach(function() {
        cy.visit('/')
    })

    it('Failed login with empty fields', function() {
        cy.contains('LOGIN').click()
        cy.get('.ui.error.message').should('include.text', 'Password is required')
        cy.get('.ui.error.message').should('include.text', 'Email is required')
        cy.url().should('include', '/login')
    })

    it('Failed login with non existing account', function() {
        cy.get('#uniforms-0000-0000')
            .type('fake@email.com')
            .should('have.value', 'fake@email.com')
        cy.get('#uniforms-0000-0001')
            .type('123')
            .should('have.value', '123')
        cy.contains('LOGIN').click()
        cy.get('.s-alert-box-inner').should('contain', 'Something went wrong. Please check your credentials.')
    })

    it('Failed login with existing account but wrong password', function() {
        cy.get('#uniforms-0000-0000')
            .type('test@test.com')
            .should('have.value', 'test@test.com')
        cy.get('#uniforms-0000-0001')
            .type('123')
            .should('have.value', '123')
        cy.contains('LOGIN').click()
        cy.get('.s-alert-box-inner').should('contain', 'Something went wrong. Please check your credentials.')
    })

    it('Login successfully', function() {
        cy.get('#uniforms-0000-0000')
            .type('test@test.com')
            .should('have.value', 'test@test.com')
        cy.get('#uniforms-0000-0001')
            .type('Aaaaaaaa00')
            .should('have.value', 'Aaaaaaaa00')
        cy.contains('LOGIN').click()
        cy.url().should('include', '/admin/projects')
    })
})
