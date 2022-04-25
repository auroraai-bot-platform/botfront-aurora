describe('Initial setup', function () {
    before(function () {
        if (!Cypress.env('MODE') || Cypress.env('MODE') !== 'CI_RUN') {
            cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.dropDatabase();"');
            // Wiping the db also wipes the indexes we need to recreate those
            cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"');
            cy.wait(1000);
        }
        cy.waitForResolve(Cypress.env('baseUrl'));
    });

    it('Should create project when completing the initial setup', () => {
        cy.visit('/');
        cy.url().should('contain', '/setup/welcome');
        cy.get('[data-cy=start-setup]').click();

        cy.get('#uniforms-0001-0001').type('Testing');
        cy.get('#uniforms-0001-0003').type('McTest');
        cy.get('#uniforms-0001-0005').type('test@test.com');
        cy.get('#uniforms-0001-0007').type('aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('aaaaaaa');
        cy.get('[data-cy="account-create-button"]').click();

        cy.contains('The passwords are not matching');
        cy.contains('Your password should contain at least');

        cy.get('#uniforms-0001-0007').type('{selectall}{del}Aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('{selectall}{del}Aaaaaaaa00');
        cy.get('[data-cy="account-create-button"]').click();

        cy.deleteProject('chitchat-*')
        cy.createProject('bf', 'trial', 'en')
    });
});
