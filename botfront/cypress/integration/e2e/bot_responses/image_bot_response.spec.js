const imageUrlA = 'https://botfront.io/images/illustrations/conversational_design_with_botfront.png'
const imageUrlB = 'https://botfront.io/images/illustrations/botfront_rasa_easy_setup.png'

describe('Image bot responses', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('Create a custom response using the response editor', () => {
        cy.createResponseFromResponseMenu('image', 'test_A')
        cy.setImage(imageUrlA)
        cy.escapeModal()
        cy.dataCy('template-intent').contains('utter_test_A').should('exist')
        cy.dataCy('response-text').find('img').should('have.attr', 'src').and('equal', imageUrlA)
    })
    
    it('Add and edit image variations', () => {
        //Add image variations
        cy.createResponseFromResponseMenu('image', 'test_A')
        cy.setImage(imageUrlA)
        cy.dataCy('add-variation').click()
        cy.setImage(imageUrlB, 1)
        cy.escapeModal()
        cy.dataCy('template-intent').contains('utter_test_A').should('exist')
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src').and('equal', imageUrlA)
        cy.dataCy('response-text').find('img').last().should('have.attr', 'src').and('equal', imageUrlB)
        
        //Edit image variations
        cy.dataCy('edit-response-0').click()
        cy.dataCy('icon-trash').first().click()
        cy.dataCy('icon-trash').first().click()
        cy.setImage(imageUrlB, 1)
        cy.escapeModal()
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src').and('equal', imageUrlB)
        cy.dataCy('response-text').find('img').should('have.length', 1)
    })

    it('Provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr')
        cy.visit('/project/bf/dialogue')
        cy.createStoryGroup()
        cy.createFragmentInGroup()
        cy.dataCy('single-story-editor').trigger('mouseover')
        cy.dataCy('add-bot-line').click({ force: true })
        cy.dataCy('from-image-template').click({ force: true })
        cy.dataCy('language-selector').click().find('div').contains('French').click({ force: true })
        cy.dataCy('image-container').should('exist')
    })
})
