describe('Initial setup', () => {
    before(() => {
        cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.dropDatabase();"')
        .its('stdout').should('contain', '{ "ok" : 1 }')
        // Wiping the db also wipes the indexes we need to recreate those
        cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"')
        .its('stdout').should('contain', '{\n\t"numIndexesBefore" : 1,\n\t"numIndexesAfter" : 2,\n\t"createdCollectionAutomatically" : true,\n\t"ok" : 1\n}')
        cy.waitForResolve(Cypress.env('baseUrl'))
        cy.visit('/')
        cy.get('[data-cy="start-setup"]').click()
        cy.get('[data-cy="account-step"]').should('contain', 'Create your admin account')
    })

    it('Ensure regex is working', () => {
        cy.get('[data-cy="account-create-button"]').click()
        cy.get('[data-cy="account-create-button"]').should('be.disabled')
        cy.get('[class="ui error message"]').find('li').should('have.length', 5)
    })

    it('Create admin account', () => {
        cy.get('#uniforms-0001-0001').type('Testing')
        cy.get('#uniforms-0001-0003').type('McTest')
        cy.get('#uniforms-0001-0005').type('test@test.com')
        cy.get('#uniforms-0001-0007').type('Aaaaaaaa00')
        cy.get('#uniforms-0001-0009').type('Aaaaaaaa00')
        cy.get('[data-cy="account-create-button"]').click()
    })

    it('Create project', () => {
        cy.login()
        cy.deleteProject('chitchat-*')
        cy.createProject('bf', 'trial', 'en')
    })
})
