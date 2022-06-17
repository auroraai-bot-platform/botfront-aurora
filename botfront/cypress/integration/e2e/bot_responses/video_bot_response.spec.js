const videoUrlA = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const videoUrlB = 'https://www.youtube.com/watch?v=HEXWRTEbj1I'

describe('Video bot responses', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })
    it('Create a custom response using the response editor', () => {
        cy.createResponseFromResponseMenu('video', 'test_A')
        cy.setVideo(videoUrlA)
        cy.escapeModal()
        cy.dataCy('template-intent').contains('utter_test_A').should('exist')
        cy.dataCy('response-text').find('div').contains('VideoPayload')
    })

    it('Add and edit video variations', () => {
        //Add variations
        cy.createResponseFromResponseMenu('video', 'test_A')
        cy.setVideo(videoUrlA)
        cy.dataCy('add-variation').click()
        cy.setVideo(videoUrlB, 1)
        cy.escapeModal()
        cy.dataCy('template-intent').contains('utter_test_A').should('exist')
        cy.dataCy('response-text').find('div').first().contains('VideoPayload')
        cy.dataCy('response-text').find('div').last().contains('VideoPayload')
        
        //Edit variations
        cy.dataCy('edit-response-0').click()
        cy.dataCy('icon-trash').first().click()
        cy.dataCy('icon-trash').first().click()
        cy.setVideo(videoUrlB)
        cy.escapeModal()
        cy.dataCy('response-text').find('div').first().contains('VideoPayload')
        cy.dataCy('response-text').find('div').first().should('have.length', 1)
    })

    it('Provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr')
        cy.visit('/project/bf/dialogue')
        cy.createStoryGroup()
        cy.createFragmentInGroup()
        cy.dataCy('single-story-editor').trigger('mouseover')
        cy.dataCy('add-bot-line').click({ force: true })
        cy.dataCy('from-video-template').click({ force: true })
        cy.dataCy('language-selector').click().find('div').contains('French').click({ force: true })
        cy.dataCy('video-container').should('exist')
    })
})
