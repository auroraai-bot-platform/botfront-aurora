const gazetteName = 'growth'
const gazetteValues = 'raise, increase, augmentation'
const sortedGazetteValues = 'augmentation, increase, raise'

const visitGazette = (projectId) => {
    cy.visit(`/project/${projectId}/nlu/models`)
    cy.contains('Training Data').click()
    cy.contains('Gazette').click()
}

const getGazetteRow = () => cy.contains(sortedGazetteValues).closest('.rt-tr')

describe('Gazette', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    beforeEach(() => {
        cy.login()
        visitGazette('bf')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    it('create a gazette with supplied parameters', () => {
        cy.get('.input.lookup-table-key-input input').type(gazetteName)
        cy.get('textarea.lookup-table-values').type(gazetteValues)
        cy.contains('Add').click()
        getGazetteRow().children().first().should('contain', gazetteName)
        getGazetteRow().children().eq(1).should('contain', sortedGazetteValues)
    })

    it('change gazette mode', () => {
        visitGazette('bf')
        getGazetteRow().children().eq(2).find('input').click()
        cy.get('.ui.popup').contains('token_set_ratio').click()
        getGazetteRow().children().eq(2).find('input').should('have.attr', 'value', 'token_set_ratio')
    })

    it('edit the gazette examples', () => {
        visitGazette('bf')
        getGazetteRow().children().eq(1).click()
        getGazetteRow().children().eq(1).find('textarea').type('{end}{del},,')
        cy.contains('Gazette').click()
        getGazetteRow().children().eq(1).should('contain', sortedGazetteValues)
    })

    it('remove the values and fail removing it without crashing', () => {
        visitGazette('bf')
        getGazetteRow().children().eq(1).click()
        getGazetteRow().children().eq(1).find('textarea').type('{selectAll}{del}')
        
        //we click elsewhere to end the editing
        cy.contains('Gazette').click()
        getGazetteRow().children().eq(1).should('contain', sortedGazetteValues)
        getGazetteRow().children().first().click()
        getGazetteRow().children().first().find('input').type('{selectAll}{del}')

        //we click elsewhere to end the editing
        cy.contains('Gazette').click()
        getGazetteRow().children().first().should('contain', gazetteName)
    })

    it('delete the created gazette', () => {
        visitGazette('bf')
        getGazetteRow().findCy('icon-trash').click({ force: true })
        cy.get('body').should('not.contain', sortedGazetteValues)
        cy.contains(sortedGazetteValues).should('not.exist')
    })
})
