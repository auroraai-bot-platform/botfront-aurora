const imageUrlA = 'https://botfront.io/images/illustrations/conversational_design_with_botfront.png'
const imageUrlB = 'https://botfront.io/images/illustrations/botfront_rasa_easy_setup.png'

describe('Carousel bot responses', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('Create and edit a carousel using the response editor', () => {
        cy.createResponseFromResponseMenu('carousel', 'test_A')
        cy.setImage(imageUrlA)
        cy.setTitleAndSubtitle('fancy title', 'fancy subtitle')
        cy.addButtonOrSetPayload('postback option', { payload: { intent: 'get_started' } }, 0)
        cy.addButtonOrSetPayload('web_url option', { url: 'http://yahoo.com/' }, 0)
        cy.dataCy('add-slide').click()
        cy.get('.carousel-slide').should('have.length', 3)
        cy.setImage(imageUrlB, 1)
        cy.escapeModal()
        cy.dataCy('template-intent').contains('utter_test_A').should('exist')

        // Verify persistence
        cy.dataCy('edit-response-0').click()
        cy.get('.carousel-slide').eq(0).find('img').should('have.attr', 'src').and('equal', imageUrlA)
        cy.get('.carousel-slide').eq(0).should('contain.text', 'fancy title')
        cy.get('.carousel-slide').eq(1).find('img').should('have.attr', 'src').and('equal', imageUrlB)

        // Swap em out
        cy.get('.carousel-slide').eq(1).as('second')
        cy.get('.carousel-slide').eq(0).first().dragTo('@second', false)
        cy.get('.carousel-slide').should(els => expect(els[1]).to.contain('fancy title'))
        cy.escapeModal()

        // Verify persistence
        cy.dataCy('edit-response-0').click()
        cy.get('.carousel-slide').eq(0).find('img').should('have.attr', 'src').and('equal', imageUrlB)
        cy.get('.carousel-slide').eq(1).should('contain.text', 'fancy title')
        cy.get('.carousel-slide').eq(1).find('img').should('have.attr', 'src').and('equal', imageUrlA)
    })
})
