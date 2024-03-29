describe('Project misc tab', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })
    
    it('migration status exists and the search indicies work after being rebuilt', () => {
        cy.visit('admin/settings/global')
        cy.get('a.item').contains('Misc').click()
        cy.dataCy('migration-status').contains('OK').should('exist')
        cy.dataCy('rebuild-button').click()
        cy.dataCy('rebuild-indices-confirm').find('.primary.button').click()
        cy.dataCy('rebuild-indices-confirm').should('not.exist')
        cy.dataCy('rebuild-button').should('exist')
        cy.visit('project/bf/dialogue')
        cy.dataCy('stories-search-bar').click()
        cy.dataCy('stories-search-bar').find('input').type('get_', { force: true })
        cy.dataCy('stories-search-item').contains('Get started')
    })
})
