describe('Environment changes', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    function changeEnv(env) {
        cy.dataCy('env-selector').click()
        cy.dataCy('env-selector').find('div.menu').contains(env).click()
    }

    function checkConversationEmpty() {
        cy.dataCy('no-conv').should('exist')
    }

    it('dropdown menu should only list selected environments', () => {
        cy.visit('/project/bf/incoming')
        cy.dataCy('conversations').click()
        cy.dataCy('env-selector').should('not.exist')
        cy.visit('/project/bf/settings')
        cy.contains('Project Info').click()
        cy.dataCy('deployment-environments').children().contains('production').click()
        cy.dataCy('save-changes').click()
        cy.visit('/project/bf/incoming')
        cy.dataCy('conversations').click()
        cy.dataCy('env-selector').click()
        cy.dataCy('env-selector').find('div.menu').should('contain.text', 'development').should('contain.text', 'production')
    })

    it('switch between environments even if they are empty', () => {
        cy.visit('/project/bf/settings')
        cy.contains('Project Info').click()
        cy.dataCy('deployment-environments').children().contains('production').click()
        cy.dataCy('save-changes').click()
        cy.visit('/project/bf/incoming')
        cy.dataCy('conversations').click()
        changeEnv('production')
        checkConversationEmpty()
        changeEnv('development')
        checkConversationEmpty()
    })

    it('display the right conversations and activity by environment', () => {
        cy.addConversationFromTemplate('bf', 'dev', 'dev1', { language: 'fr', env: 'development' })
        cy.addConversationFromTemplate('bf', 'dev', 'dev2', { language: 'fr', env: 'development' })
        cy.addConversationFromTemplate('bf', 'prod', 'prod', { language: 'fr', env: 'production' })

        cy.visit('/project/bf/settings')
        cy.contains('Project Info').click()
        cy.dataCy('deployment-environments').children().contains('production').click()
        cy.dataCy('save-changes').click()
        cy.visit('/project/bf/incoming')
        cy.dataCy('conversations').click()

        changeEnv('production')
        cy.get('.ui.vertical.menu').should('not.contain.text', 'dev1').should('not.contain.text', 'dev2').should('contain.text', 'prod').should('not.contain.text', 'stage')
        cy.dataCy('newutterances').click()
        cy.dataCy('utterance-text').should('not.contain.text', 'dev').should('contain.text', 'prod')

        cy.dataCy('conversations').click()
        changeEnv('development')
        cy.get('.ui.vertical.menu').should('contain.text', 'dev1').should('contain.text', 'dev2').should('not.contain.text', 'prod').should('not.contain.text', 'stage')
        cy.dataCy('newutterances').click()
        cy.dataCy('utterance-text').should('contain.text', 'dev').should('not.contain.text', 'prod')
    })
})
