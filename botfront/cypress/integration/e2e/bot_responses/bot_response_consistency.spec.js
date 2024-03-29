const RESPONSE_TEXT = 'test delete'
const STORY_NAME = 'myStory'
const GROUP_NAME = 'myGroup'

const createResponse = () => {
    cy.dataCy('from-text-template').click({ force: true })
    cy.dataCy('bot-response-input').find('textarea').should('be.empty')
    cy.dataCy('bot-response-input').find('textarea').clear().type(RESPONSE_TEXT).blur()
    cy.dataCy('bot-response-input').should('have.text', RESPONSE_TEXT)
}

const checkResponsesDeleted = () => {
    /*
        we check for the permanent response first because it make checking for other
        responses existence more reliable. other checks pass when the shouldn't:
            1. Checking for the no responses message passes because the message is
            always briefly rendered
            2. Checking for dataCy('intent-label').should('not.exist') or similar
            passes while the bot responses page is loading
        checking for the permanent response to exist causes the test to wait for the page
        to load before checking if the response from the test was correctly deleted
    */
    cy.visit('/project/bf/responses')
    cy.dataCy('template-intent').contains('utter_hi').should('exist')
    cy.dataCy('template-intent').should('have.length', 1)
}

describe('Bot response consistency', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf')
        cy.visit('/project/bf/dialogue')
        cy.browseToStory('Greetings', 'Example group')
        cy.dataCy('story-title').should('have.value', 'Greetings')
        cy.dataCy('bot-response-input').find('textarea').clear().type('permanent response').blur()
        cy.createStoryGroup({ groupName: GROUP_NAME })
        cy.createFragmentInGroup({ groupName: GROUP_NAME, fragmentName: STORY_NAME })
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('Delete an existing response from the project when it is deleted in a story', () => {
        createResponse()
        cy.dataCy('story-title').click({ force: true })
        cy.dataCy('icon-trash').click({ force: true })
        cy.dataCy('confirm-yes').click()
        cy.dataCy('bot-response-input').should('not.exist')
        checkResponsesDeleted()
    })

    it('Delete a response in a story from the project when the story is deleted', () => {
        createResponse()
        cy.visit('/project/bf/responses')
        cy.dataCy('response-text').should('contain.text', RESPONSE_TEXT)
        cy.visit('/project/bf/dialogue')
        cy.deleteStoryOrGroup(STORY_NAME, 'story')
        checkResponsesDeleted()
    })

    it('Delete an existing response from the project when the story group is deleted', () => {
        createResponse()
        cy.visit('/project/bf/responses')
        cy.dataCy('response-text').should('contain.text', RESPONSE_TEXT)
        cy.visit('/project/bf/dialogue')
        cy.deleteStoryOrGroup(STORY_NAME, 'story')
        cy.visit('/project/bf/responses')

        //To properly retry the visit must be done again
        checkResponsesDeleted()
    })
    
    it('Delete a response in a branch when the branch is deleted', () => {
        cy.dataCy('create-branch').click()
        cy.dataCy('add-branch').click()
        cy.dataCy('branch-label').should('have.length', 3)
        cy.dataCy('branch-menu').first().findCy('branch-label').last().should('have.class', 'active')
        cy.dataCy('create-branch').click()
        cy.getBranchEditor(1).findCy('from-text-template').click({ force: true })
        cy.dataCy('bot-response-input').find('textarea').should('be.empty')
        cy.dataCy('bot-response-input').find('textarea').clear().type('first response should not exist')       
        cy.getBranchEditor(2).findCy('from-text-template').click({ force: true })
        cy.dataCy('bot-response-input').should('have.length', 2)
        cy.dataCy('bot-response-input').last().find('textarea').should('be.empty')
        cy.dataCy('bot-response-input').last().find('textarea').clear().type('second response should not exist')
        cy.dataCy('branch-menu').first().findCy('branch-label').first().click()       
        cy.getBranchEditor(1).findCy('from-text-template').click({ force: true })
        cy.dataCy('bot-response-input').find('textarea').should('be.empty')
        cy.dataCy('bot-response-input').find('textarea').clear().type('third response should exist')
        cy.dataCy('branch-label').eq(2).click({ click: true })
        cy.dataCy('branch-label').eq(2).trigger('mouseover')
        cy.dataCy('delete-branch').eq(2).click({ force: true }).dataCy('confirm-yes').click({ force: true })

        //Check the correct bot responses were deleted from the project
        cy.visit('/project/bf/responses')
        cy.dataCy('template-intent').contains('utter_hi').should('exist')
        cy.dataCy('response-text').contains('first response should not exist').should('not.exist')
        cy.dataCy('response-text').contains('second response should not exist').should('not.exist')
        cy.dataCy('response-text').contains('third response should exist').should('exist')
        cy.dataCy('template-intent').should('have.length', 2)
    })

    it('Ignore stories from other projects when deleting responses', () => {
        cy.visit('/project/bf/dialogue')
        cy.browseToStory('Farewells', 'Example group')
        cy.dataCy('story-title').should('have.value', 'Farewells')
        cy.dataCy('bot-response-input').find('textarea').click().type('a').blur()
        cy.visit('/project/bf/responses')
        cy.dataCy('template-intent').contains('utter_bye').should('exist')
        cy.visit('/project/bf/dialogue')
        cy.browseToStory('Farewells', 'Example group')
        cy.deleteStoryOrGroup('Farewells')
        checkResponsesDeleted()
    })
})
