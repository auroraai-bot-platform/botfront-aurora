const unlockGitDropdown = () => {
    // button won't show unless git is set up in project settings
    // so this fn can be used as admin to set it up fast
    cy.import('bf', 'dummy-git-settings/bfconfig.yml')
}

describe('Roles import:x and export:x', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'myProject', 'en')
    })

    afterEach(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('access export menu', () => {
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'export:x'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').children().should('have.length', 1)

        cy.dataCy('export-project-tab').should('exist')
        cy.dataCy('import-project-tab').should('not.exist')
    })

    it('access import menu, and show git menu', () => {
        unlockGitDropdown()
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'import:x'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').children().should('have.length', 1)

        cy.dataCy('import-project-tab').should('exist')
        cy.dataCy('export-project-tab').should('not.exist')

        cy.visit('/project/bf/dialogue')
        cy.dataCy('stories-search-bar').should('exist')
        cy.dataCy('git-dropdown').should('exist')
    })

    it('accessing import export page or show git menu should not be possible', () => {
        unlockGitDropdown()
        cy.createDummyRoleAndUser({ permission: ['stories:r'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings/import-export')
        cy.url().should('include', '/403')

        cy.visit('/project/bf/dialogue')
        cy.dataCy('stories-search-bar').should('exist')
        cy.dataCy('git-dropdown').should('not.exist')
    })

    it('access both import and export', () => {
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'import:x', 'export:x'] })
        cy.login({ admin: false })
        cy.visit('/project/bf/settings/import-export')
        cy.dataCy('port-project-menu').children().should('have.length', 2)

        cy.dataCy('import-project-tab').should('exist')
    })
})
