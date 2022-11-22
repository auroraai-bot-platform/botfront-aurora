describe('Global settings read permissions', () => {
    before(() => {
        cy.createDummyRoleAndUser({ permission: ['global-settings:r'] })
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    beforeEach(() => {
        cy.login({ admin: false })
        cy.visit('/admin/settings')
    })

    after(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('access global settings through the admin sidebar', () => {
        cy.url().should('include', '/admin/settings')
        cy.dataCy('global-settings-link').should('exist')
    })
    
    it('all global settings save buttons should be hidden', () => {      
        cy.get('div.ui.vertical.menu a.item').each((item) => {
            cy.wrap(item).click()
            cy.dataCy('save-global-settings').should('not.exist')
            cy.dataCy('save-button').should('not.exist')
        })
    })
    
    it('all global settings input fields should be disabled', () => {
        const simpleDisabledCheck = [
            'Default NLU Pipeline',
            'Default credentials',
            'Default endpoints',
            'Default default domain',
            'Webhooks',
            'Security',
            'Misc',
        ]
        // we check the panes where every single field is disabled
        simpleDisabledCheck.forEach((menu) => {
            cy.contains(menu).click()
            cy.get('div.column div.segment .field').each(field => cy.wrap(field).should('have.class', 'disabled'))
        })

        // check the more panes where not eveything is disabled (eg: label)
        cy.visit('/admin/settings')
        cy.contains('Appearance').click()
        cy.get('div.column div.segment > .field').each(field => cy.wrap(field).should('have.class', 'disabled'))
        cy.get('div.column div.segment > .fields').each(field => cy.wrap(field).should('have.class', 'disabled'))
    })

    it('should not be able to access project settings from global settings and vice versa', () => {
        cy.get('div.ui.vertical.menu a.item').contains('Project Settings').should('not.exist')
        cy.visit('/project/bf/settings')
        cy.dataCy('project-settings-more').should('not.exist')
    })
})
