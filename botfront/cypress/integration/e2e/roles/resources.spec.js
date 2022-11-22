describe('Story permissions', () => {
    beforeEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
        cy.createProject('bf', 'myProject', 'en')
    })

    afterEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('editing story title should not be possible', () => {
        cy.createDummyRoleAndUser({ permission: ['resources:r'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings')
        cy.dataCy('deployment-environments').should('have.class', 'disabled')
        cy.visit('/project/bf/settings/endpoints')
        cy.dataCy('ace-field').should('have.class', 'disabled')
        cy.dataCy('Actions-Server').should('not.exist')

        // instances tab
        cy.visit('/project/bf/settings/instance')
        cy.get('.field').should('have.class', 'disabled')
        cy.dataCy('save-instance').should('not.exist')
    })

    it('see both the action server field and the yaml field with projects:w and resources:w', () => {
        cy.createDummyRoleAndUser({ permission: ['projects:w', 'resources:r'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings')
        cy.dataCy('deployment-environments').should('have.class', 'disabled')
        cy.visit('/project/bf/settings/endpoints')
        cy.dataCy('Actions-Server').find('input').type(' # test editing the action url endpoint{enter}')
        cy.dataCy('ace-field').should('have.class', 'disabled')
        cy.dataCy('save-button').click()
        cy.get('.ace_content').contains('test editing the action url endpoint').should('exist')
    })

    it('only see the yaml editor with resources:w', () => {
        cy.createDummyRoleAndUser({ permission: ['resources:w'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings/endpoints')
        cy.dataCy('ace-field').should('exist')
        cy.dataCy('Actions-Server').should('not.exist')
    })
})
