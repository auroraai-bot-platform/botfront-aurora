describe('Project core policy', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('can be saved', () => {
        cy.visit('/project/bf/dialogue')
        cy.dataCy('policies-modal').click()
        cy.dataCy('core-policies-yaml').find('textarea').focus().type(' # test', { force: true })
        cy.dataCy('augmentation-factor').find('input').click()
        cy.dataCy('augmentation-factor').find('input').type('1234')
        cy.get('[data-cy=save-button]').click()
        cy.get('[data-cy=changes-saved]').should('be.visible')
        cy.reload()
        cy.dataCy('policies-modal').click()
        cy.dataCy('augmentation-factor').find('input').should('have.value', '1234')
        cy.dataCy('core-policies-yaml').should('include.text', '# test')
    })
})
