describe('Training', function() {
    before(function() {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.waitForResolve(Cypress.env('RASA_URL'))
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`)
    })

    beforeEach(function() {
        cy.login()
        cy.visit('/project/bf/dialogue')
    })

    it('Train and serve a model containing only stories (no NLU)', function() {
        cy.train()
        cy.newChatSesh()
        cy.testChatInput('/chitchat.greet', 'hi')
    })

    it('Train and serve a model containing stories and NLU in 2 languages', function() {
        cy.createNLUModelProgramatically('bf', '', 'fr') // first don't import NLU data
        cy.train()
        cy.import('bf', 'nlu_sample_en.json', 'en') // now import the data
        cy.import('bf', 'nlu_sample_fr.json', 'fr')
        cy.train()
        cy.newChatSesh()
        cy.testChatInput('hi', 'utter_hi')
        cy.newChatSesh('fr')
        cy.testChatInput('salut', 'utter_hi')
    })

    it('Train focused stories only', function() {
        cy.get('.eye.icon.focused').should('have.length', 0)
        cy.createStoryGroup()
        cy.moveStoryOrGroup({ name: 'Greetings' }, { name: 'Groupo' })
        cy.checkMenuItemAtIndex(1, 'Greetings')
        cy.createStoryGroup({ groupName: 'Intro stories' })
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Intro stories' })
        cy.checkMenuItemAtIndex(1, 'Get started')
        cy.toggleStoryGroupFocused()
        cy.get('.eye.icon.focused').should('have.length', 1)
        cy.train()
        cy.newChatSesh()
        cy.typeChatMessage('/get_started')
        cy.get('.rw-message').should('have.length', 1) // no response
        cy.testChatInput('/chitchat.greet', 'utter_hi')
        cy.toggleStoryGroupFocused()
        cy.get('.eye.icon.focused').should('have.length', 0)
        cy.toggleStoryGroupFocused('Intro stories')
        cy.get('.eye.icon.focused').should('have.length', 1)
        cy.train()
        cy.newChatSesh()
        cy.typeChatMessage('/chitchat.greet')
        cy.get('.rw-message').should('have.length', 2) // no response
        cy.testChatInput('/get_started', 'utter_get_started')
        cy.toggleStoryGroupFocused('Intro stories')
    })
    
    it('Train and serve a model containing branches and links', function() {
        cy.import('bf', 'branch_link_project.yml')
        cy.train()
        cy.newChatSesh()

        // coffee path
        cy.testChatInput('/hi', 'utter_coffee')
        cy.testChatInput('/yes', 'utter_sugar')
        cy.testChatInput('/yes', 'utter_ok')

        // tea path
        cy.testChatInput('/hi', 'utter_coffee')
        cy.testChatInput('/no', 'utter_tea')
        cy.testChatInput('/yes', 'utter_sugar')
        cy.testChatInput('/no', 'utter_oknosugar')
    })

    it('Access bot via sharing link if sharing is enabled', function() {
        cy.visit('/chat/bf/')
        cy.get('body').contains('Sharing not enabled for project').should('exist')
        cy.visit('project/bf/dialogue')
        cy.train()
        cy.dataCy('share-bot').trigger('mouseover')
        cy.dataCy('toggle-bot-sharing').should('exist').should('not.have.class', 'checked')
            .click()
            .should('have.class', 'checked')
        cy.visit('/chat/bf/')
        cy.get('body').contains('Sharing not enabled for project').should('not.exist')
        cy.get('body').contains('utter_get_started', { timeout: 10000 }).should('exist')
        cy.dataCy('environment-dropdown').should('not.exist')

        cy.visit('/project/bf/settings')
        cy.dataCy('deployment-environments').should('exist')
        cy.dataCy('deployment-environments').find('.ui.checkbox').last().click()
        cy.dataCy('save-changes').click()
        cy.visit('/chat/bf')
        cy.dataCy('environment-dropdown').click()
        cy.dataCy('environment-dropdown').find('div').contains('production').click()
        cy.dataCy('environment-dropdown').click()
        cy.dataCy('environment-dropdown').find('.active.item').should('have.text', 'production')
    })
})