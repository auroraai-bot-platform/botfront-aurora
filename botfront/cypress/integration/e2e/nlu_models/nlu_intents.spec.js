describe('NLU intents and examples', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('/project/bf/nlu/models')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('add and delete multiple examples', () => {
        cy.addExamples(['cya', 'later'], 'byebye')
        cy.dataCy('draft-button').should('not.exist')
        cy.addExamples(['hello', 'hi guys'], 'hihi')
        cy.dataCy('draft-button').should('not.exist')
    })
})
