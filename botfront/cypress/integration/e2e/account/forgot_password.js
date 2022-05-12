describe('Forgot password', function() {
    it('Open forgot your password', function() {
        cy.visit('/')
        cy.contains('Forgot your password?').click()
        cy.url().should('include', '/forgot-password')
    })

    it('Giving email returns "check your email inbox" message', function() {
        cy.visit('/forgot-password')
        cy.get('#uniforms-0000-0000')
            .type('nathan@mrbot.ai')
            .should('have.value', 'nathan@mrbot.ai')
        cy.contains('Continue').click()
        cy.get('.ui.positive.message .header').should('contain', 'Check your email inbox')
        cy.get('.ui.message .header+p ').should('contain', 'If you have an account with us, you will find the instructions to reset your password in your inbox')
    })

    it('Go back to login from forgot password page', function() {
        cy.visit('/forgot-password')
        cy.contains('Back to Sign in').click()
        cy.url().should('include', '/login')
    })
})
