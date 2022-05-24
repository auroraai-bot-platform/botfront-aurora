describe('Project creation', () => {

    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    afterEach(() => {
        cy.deleteProject('bf')
        cy.get('@testProjectId').invoke('text').then((projectId) => {
            cy.deleteProject(projectId)
        })
    })

    it('Create and delete project', () => {
        cy.visit('/admin/projects')
        cy.dataCy('new-project').click()
        cy.get('#uniforms-0000-0001').type('test')
        cy.get('#uniforms-0000-0003').type('bf-test')
        cy.get('#uniforms-0000-0004').click()
        cy.get('#uniforms-0000-0004').children().children().first().click()
        cy.dataCy('submit-field').click()
        cy.get(':nth-child(2) > .rt-tr > :nth-child(1)').should('have.text', 'test')
        cy.get('.rt-tbody > :nth-child(2) > .rt-tr > :nth-child(2)').as('testProjectId') //creating alias for project id which is used in afterEach
        cy.get(':nth-child(2) > .rt-tr > :nth-child(3) a').click()
        cy.dataCy('delete-project').should('be.disabled')
        cy.get('.ui > label').click()
        cy.dataCy('submit-field').click()
        cy.get(':nth-child(1) > .rt-tr > :nth-child(1)').eq(1).should('have.text', 'test')
        cy.get(':nth-child(1) > .rt-tr > :nth-child(3) a').click()
        cy.dataCy('delete-project').should('not.be.disabled')
        cy.dataCy('delete-project').click()
        cy.get('.primary').click()
        cy.get(':nth-child(2) > .rt-tr > :nth-child(1)').should('not.have.text', 'test')
        cy.get('.rt-tbody > :nth-child(1) > .rt-tr > :nth-child(1)').should('have.text', 'My Project')
    })
})
