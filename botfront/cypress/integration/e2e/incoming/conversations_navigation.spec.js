describe('Incoming page conversation tab', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('/project/bf/incoming')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('show a message if no conversations', () => {
        cy.dataCy('conversations').click()
        cy.dataCy('no-conv').should('exist')
    })

    it('list all conversation in db', () => {
        cy.addConversationFromTemplate('bf', 'default', 'test1')
        cy.addConversationFromTemplate('bf', 'default', 'test2')
        cy.dataCy('conversations').click()
        cy.dataCy('conversation-item').should('have.length', 2)
    })

    it('select conversation', () => {
        cy.addCustomConversation('bf', 'test1', { events: [{ type: 'user', name: 'test1', text: 'one' }] })
        cy.addCustomConversation('bf', 'test2', { events: [{ type: 'user', name: 'test2', text: 'two' }] })
        cy.dataCy('conversations').click()
        cy.dataCy('conversation-item').eq(1).should('have.text', 'test1')
        cy.dataCy('conversation-item').eq(1).click({ force: true })
        cy.dataCy('utterance-text').contains('one').should('exist')
    })

    it('does not add pagination if 20 conversation or less', () => {
        for (let i = 0; i < 20; i += 1) {
            cy.addConversationFromTemplate('bf', 'default', `test${i}`)
        }
        cy.dataCy('conversations').click()
        cy.dataCy('pagination').should('not.exist')
        cy.dataCy('conversation-item').should('have.length', 20)
    })

    it('adds pagination if more than 20 conversations', () => {
        for (let i = 0; i < 25; i += 1) {
            cy.addConversationFromTemplate('bf', 'default', `test${i}`)
        }
        cy.dataCy('conversations').click()
        cy.dataCy('duration-filter-to').find('input').type('15')
        // add a filter to check that the query string is not removed by navigation
        cy.dataCy('apply-filters').click()
        cy.dataCy('conversation-item').should('have.length', 20)
        cy.dataCy('pagination').should('exist')
        cy.dataCy('pagination').children().last().click({ force: true })
        cy.dataCy('conversation-item').should('have.length', 5)
        cy.reload() // deep linking should bring the user to the same location after a refresh
        cy.dataCy('conversation-item').should('have.length', 5)
        cy.dataCy('duration-filter-to').find('input').should('have.value', '15')
    })
})
