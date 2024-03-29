describe('Link from analytics to conversations and apply filters', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.setTimezoneOffset()
        cy.visit('/project/bf/analytics')
    })
    
    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('Link from the conversations card', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {})
        cy.addConversationFromTemplate('bf', 'action_test', 'intenttest', {})

        // add an included intent and action
        cy.dataCy('analytics-card').first().find('[data-cy=edit-eventFilter]').click({ force: true })
        cy.addConversationEventFilter('intent', 'intent_test')
        cy.addConversationEventFilter('action', 'action_test')
        cy.addConversationEventFilter('intent', 'get_started')
        cy.dataCy('sequence-step-2').click()
        cy.dataCy('sequence-step-2').should('have.class', 'red')
        cy.escapeModal()
        cy.dataCy('analytics-card').first().find('[data-cy=edit-conversationLength]').click({ force: true })
        cy.dataCy('settings-portal-input').find('input').clear().type('1{esc}')

        // click on the most recent data in the graph
        cy.dataCy('analytics-card').first().find('[data-cy=bar-chart-button]').click()
        cy.dataCy('analytics-card').first().find('rect').last().click()

        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 3)
        cy.get('.label').contains('intent_test').should('exist')
        cy.get('.label').contains('action_test').should('exist')
        cy.get('.label').contains('get_started').should('exist').should('have.class', 'red')
        cy.dataCy('conversation-length-filter').find('input').should('have.value', '1')
        cy.dataCy('date-picker-container').find('button').contains(`${Cypress.dayjs().format('DD/MM/YYYY')} - ${Cypress.dayjs().format('DD/MM/YYYY')}`) // the date range should only include the current day
        cy.dataCy('conversation-item').contains('intenttest').should('exist')
    })

    it('Link from the conversations card in production', () => {
        cy.visit('/project/bf/settings')
        cy.contains('Project Info').click()
        cy.dataCy('deployment-environments').children().contains('production').click()
        cy.dataCy('save-changes').click()
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {env: 'production'})
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest', {env: 'production'})
        cy.visit('/project/bf/analytics')
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.changeEnv('production')

        // add an included intent
        cy.dataCy('analytics-card').first().find('[data-cy=edit-eventFilter]').click({ force: true })
        cy.addConversationEventFilter('intent', 'intent_test')
        cy.escapeModal()

        // click on the most recent data in the graph
        cy.dataCy('analytics-card').first().find('[data-cy=bar-chart-button]').click()
        cy.dataCy('analytics-card').first().find('rect').last().click()

        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1)
        cy.get('.label').contains('intent_test').should('exist')
        cy.dataCy('conversation-item').should('have.length', 1)
        cy.dataCy('env-selector').find('div.text').should('exist').should('have.text', 'production')
        cy.dataCy('conversation-item').contains('intenttest').should('exist')
        cy.dataCy('conversation-item').contains('actiontest').should('not.exist')
    })

    it('Link from the actions card', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest', {})
        cy.dataCy('analytics-card').should('have.length', 7)

        // add an included action
        cy.dataCy('analytics-card').eq(5).find('[data-cy=edit-includeActions]').click({ force: true })
        cy.dataCy('settings-portal-dropdown').click()
        cy.dataCy('settings-portal-dropdown').find('input').type('action_test{enter}{esc}')

        // click on the most recent data in the graph
        cy.dataCy('analytics-card').eq(5).find('[data-cy=bar-chart-button]').click()
        cy.dataCy('analytics-card').eq(5).find('rect').last().click()

        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 2)
        cy.get('.label').contains('action_test').should('exist')
        cy.get('.label').contains('action_botfront_fallback').should('exist')
        cy.dataCy('date-picker-container').find('button').contains(`${Cypress.dayjs().format('DD/MM/YYYY')} - ${Cypress.dayjs().format('DD/MM/YYYY')}`) // the date range should only include the current day
        cy.dataCy('conversation-item').contains('actiontest').should('exist')
    })

    it('Link with conversation duration, > 180', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', {env: 'development', language: 'en', duration: 181})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(3).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('duration-filter-from').find('input').should('have.value', '180')
        cy.dataCy('conversation-item').contains('default').should('exist')
    })

    it('Link with conversation duration, < 30', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', {env: 'development', language: 'en', duration: 10})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(3).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('duration-filter-to').find('input').should('have.value', '30')
        cy.dataCy('conversation-item').contains('default').should('exist')
    })

    it('Link with conversation duration 30 to 60', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', {env: 'development', language: 'en', duration: 31})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(3).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('duration-filter-from').find('input').should('have.value', '30')
        cy.dataCy('duration-filter-to').find('input').should('have.value', '60')
        cy.dataCy('conversation-item').contains('default').should('exist')
    })

    it('Link with conversation length from the conversation length card', () => {
        cy.addConversationFromTemplate('bf', 'len_3', 'len3', {})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(1).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('length-filter').find('input').should('have.value', '3')
        cy.dataCy('length-filter').find('.text').contains('=').should('exist')
        cy.dataCy('conversation-item').contains('len3').should('exist')
    })

    it('Link with an intent from top 10 intents', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(2).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1)
        cy.get('.label').contains('intent_dummy').should('exist')
        cy.dataCy('conversation-item').contains('intenttest').should('exist')
    })

    it('Set the date when linking from an analytics card', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {})
        cy.dataCy('analytics-card').should('have.length', 7)

        // set date to a 30 day range
        cy.dataCy('analytics-card').eq(2).find('.loader').should('not.exist')
        cy.dataCy('analytics-card').eq(2).find('[data-cy=date-picker-container]').click()
        cy.dataCy('date-range-selector').click()
        cy.dataCy('date-range-selector').find('span.text').contains('Last 30 days').click({ force: true })
        cy.dataCy('apply-new-dates').click()

        // verify the date is correct
        cy.dataCy('analytics-card').eq(2).find('rect').last().click()
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('date-picker-container').find('button').contains(`${Cypress.dayjs().subtract(29, 'days').startOf('day').format('DD/MM/YYYY')} - ${Cypress.dayjs().format('DD/MM/YYYY')}`)
        cy.dataCy('conversation-item').contains('intenttest').should('exist')
    })

    it('Set the correct order from a funnel', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest1', {})
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest2', {})
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre1', {})
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre2', {})
        cy.dataCy('analytics-card').should('have.length', 7)

        // set date to a 30 day range
        cy.dataCy('create-card').click()
        cy.dataCy('create-card').find('div.item').eq(6).click()
        cy.dataCy('analytics-card').should('have.length', 8)
        cy.dataCy('card-ellipsis-menu').first().click()
        cy.dataCy('edit-selectedSequence').click({ force: true })
        cy.dataCy('remove-step-0').click()
        cy.addConversationEventFilter('intent', 'chitchat.greet')
        cy.addConversationEventFilter('action', 'action_test')
        cy.get('.page').click({ force: true })
        cy.dataCy('analytics-card').first().find('rect').last().click()
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 2)
        cy.get('.label').contains('chitchat.greet').should('exist')
        cy.get('.label').contains('action_test').should('exist')
        cy.dataCy('intents-actions-filter').find('.and-or-order div.text').should('have.text', 'In order')
        cy.dataCy('conversation-item').should('have.text', 'actiontest2actiontest1')
    })

    it('Set the correct order from a funnel with exclusion', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest1', {})
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest2', {})
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre1', {})
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre2', {})
        cy.addConversationFromTemplate('bf', 'action_test_and_autre', 'actiontestautre', {})
        cy.dataCy('analytics-card').should('have.length', 7)

        // set date to a 30 day range
        cy.dataCy('create-card').click()
        cy.dataCy('create-card').find('div.item').eq(6).click()
        cy.dataCy('analytics-card').should('have.length', 8)
        cy.dataCy('card-ellipsis-menu').first().click()
        cy.dataCy('edit-selectedSequence').click({ force: true })
        cy.dataCy('remove-step-0').click()
        cy.addConversationEventFilter('intent', 'chitchat.greet')
        cy.addConversationEventFilter('action', 'action_test')
        cy.addConversationEventFilter('action', 'action_autre')
        cy.dataCy('sequence-step-2').click()
        cy.dataCy('sequence-step-2').should('have.class', 'red')
        cy.get('.page').click({ force: true })
        cy.dataCy('analytics-card').first().find('rect').last().click()
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 3)
        cy.get('.label').contains('chitchat.greet').should('exist')
        cy.get('.label').contains('action_test').should('exist')
        cy.dataCy('intents-actions-filter').find('.and-or-order div.text').should('have.text', 'In order')
        cy.dataCy('conversation-item').should('have.text', 'actiontest2actiontest1')
    })

    it('Link from a pie chart', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {})
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('analytics-card').eq(2).find('[data-cy=pie-chart-button]').click()
        cy.dataCy('analytics-card').eq(2).find('path').eq(1).click({ force: true })
        cy.dataCy('conversation-item').should('exist')
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1)
        cy.get('.label').contains('intent_dummy').should('exist')
        cy.dataCy('conversation-item').contains('intenttest').should('exist')
    })
})
