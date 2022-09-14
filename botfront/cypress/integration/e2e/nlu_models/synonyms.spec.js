const synonymName = 'growth'
const synonymValues = 'raise, increase, augmentation'
const sortedSynonymsValues = 'augmentation, increase, raise'

const visitSynonyms = (projectId) => {
    cy.visit(`/project/${projectId}/nlu/models`)
    cy.contains('Training Data').click()
    cy.contains('Synonyms').click()
}

const getSynonymRow = () => cy.contains(sortedSynonymsValues).closest('.rt-tr')

describe('Synonyms', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
    })

    beforeEach(() => {
        cy.login()
        visitSynonyms('bf')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    it('create a synonym with supplied parameters', () => {
        cy.get('.input.lookup-table-key-input input').type(synonymName)
        cy.contains('Add').should('have.class', 'disabled')
        cy.get('textarea.lookup-table-values').type(`${synonymValues},{backspace},,`)
        cy.get('textarea.lookup-table-values').should('have.value', `${synonymValues}, , `)
        cy.contains('Add').click()
        getSynonymRow().children().first().should('contain', synonymName)
        getSynonymRow().children().eq(1).should('contain', sortedSynonymsValues)
    })

    it('edit the synonym values', () => {
        getSynonymRow().children().eq(1).click()
        getSynonymRow().children().eq(1).find('textarea').type('{end}{del},,')
        cy.contains('Synonyms').click()
        getSynonymRow().children().eq(1).should('contain', sortedSynonymsValues)
    })

    it('remove the values and fail removing it without crashing', () => {
        getSynonymRow().children().eq(1).click()
        getSynonymRow().children().eq(1).find('textarea').type('{selectAll}{del}')

        // we click elsewhere to end the editing
        cy.contains('Synonyms').click()
        getSynonymRow().children().eq(1).should('contain', sortedSynonymsValues)
        getSynonymRow().children().first().click()
        getSynonymRow().children().first().find('input').type('{selectAll}{del}')

        // we click elsewhere to end the editing
        cy.contains('Synonyms').click()
        getSynonymRow().children().first().should('contain', synonymName)
    })

    it('delete the created synonym', () => {
        getSynonymRow().findCy('icon-trash').click({ force: true })
        cy.get('body').should('not.contain', sortedSynonymsValues)
        cy.contains(sortedSynonymsValues).should('not.exist')
    })
})
