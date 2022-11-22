describe('Projects:r can access but not edit settings', () => {
    before(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
        cy.createProject('bf', 'myProject', 'en')
    })

    after(() => {
        cy.login()
        cy.deleteProject('bf')
    })

    it('view a read only version of all project settings tabs as projects:r', () => {
        cy.removeDummyRoleAndUser('test@test.test', 'projects:r')
        cy.createDummyRoleAndUser({ permission: ['projects:r'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings')

        // project info tab
        cy.get('.project-name').find('input').should('have.value', 'myProject')
        cy.dataCy('language-selector').should('have.class', 'disabled')
        cy.dataCy('deployment-evironments').should('not.exist')
        cy.dataCy('save-button').should('not.exist')

        // credentials tab
        cy.visit('/project/bf/settings/credentials')
        cy.dataCy('ace-field').should('have.class', 'disabled')
        cy.dataCy('save-button').should('not.exist')

        // default domain tab
        cy.visit('/project/bf/settings/default-domain')
        cy.dataCy('ace-field').should('have.class', 'disabled')
        cy.dataCy('save-button').should('not.exist')

        // import export tab
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').children('.item').should('have.length', 1)
        cy.dataCy('port-project-menu').find('.item').first().should('have.text', 'Export')

        // endpoints tab
        cy.visit('/project/bf/settings/endpoints')
        cy.dataCy('ace-field').should('not.exist')
        cy.dataCy('Actions-Server').should('have.class', 'disabled')
        cy.dataCy('save-button').should('not.exist')

        // instances tab
        cy.dataCy('settings-menu').contains('Instance').should('not.exist')
    })

    it('view a write-able version of all project settings tabs as projects:w', () => {
        cy.removeDummyRoleAndUser()
        cy.createDummyRoleAndUser({ permission: ['projects:w'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings')

        // project info tab
        cy.dataCy('language-selector').should('not.have.class', 'disabled')
        cy.dataCy('save-changes').should('exist')

        // credentials tab
        cy.visit('/project/bf/settings/credentials')
        cy.dataCy('ace-field').should('not.have.class', 'disabled')
        cy.dataCy('save-button').should('exist')

        // default domain tab
        cy.visit('/project/bf/settings/default-domain')
        cy.dataCy('ace-field').should('not.have.class', 'disabled')
        cy.dataCy('save-button').should('exist')

        // import export tab
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').children('.item').should('have.length', 2)

        // endpoints tab
        cy.visit('/project/bf/settings/endpoints')
        cy.dataCy('Actions-Server').should('exist')
        cy.dataCy('ace-field').should('not.exist')
        cy.dataCy('save-button').should('exist')
    })

    it('only show the settings side menu link for projects:r', () => {
        cy.removeDummyRoleAndUser('test@test.test', 'users:r')
        cy.createDummyRoleAndUser({ permission: ['stories:r'], scope: 'bf' })
        cy.login({ admin: false })
        cy.visit('/project/bf/dialogue')

        // check non authorized users cannot see the projects tab
        cy.dataCy('dialogue-sidebar-link').should('exist')
        cy.dataCy('settings-sidebar-link').should('not.exist')
    })

    it('only show the projects side menu link for projects:r GLOBAL scope', () => {
        cy.removeDummyRoleAndUser('test@test.test', 'users:r')
        cy.createDummyRoleAndUser({ permission: ['users:r'], scope: 'GLOBAL' })
        cy.login({ admin: false })
        cy.visit('/admin')

        // check non authorized users cannot see the projects tab
        cy.dataCy('users-link').should('exist')
        cy.dataCy('projects-link').should('not.exist')
    })

    it('should be able to view but not edit projects as projects:r GLOBAL scope', () => {
        cy.removeDummyRoleAndUser()
        cy.createDummyRoleAndUser({ permission: ['projects:r'], scope: 'GLOBAL' })
        cy.login({ admin: false })
        cy.visit('/admin')

        // check authorized users can view projects
        cy.dataCy('projects-link').click()
        cy.get('.header').contains('Projects')
        cy.get('.rt-td').contains('myProject').should('exist')
        cy.dataCy('edit-projects').should('not.exist')
        cy.dataCy('new-project').should('not.exist')
    })

    it('edit projects with projects:w GLOBAL scope', () => {
        cy.removeDummyRoleAndUser()
        cy.createDummyRoleAndUser({ permission: ['projects:w'], scope: 'GLOBAL' })
        cy.login({ admin: false })
        cy.visit('/admin')

        // check authorized users can view projects
        cy.dataCy('projects-link').click()
        cy.dataCy('projects-page-header').should('exist')
        cy.dataCy('edit-projects').should('have.length', 1)
        cy.get('.rt-td').contains('myProject').should('exist')
        cy.dataCy('new-project').should('exist')
        cy.dataCy('edit-projects').first().click()
        cy.dataCy('submit-field').should('exist')
    })
})
