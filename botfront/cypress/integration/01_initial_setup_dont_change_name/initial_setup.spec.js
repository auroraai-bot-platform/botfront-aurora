/* global cy Cypress:true */

/* describe('intial setup', function () {
    before(function () {
        if (!Cypress.env('MODE') || Cypress.env('MODE') !== 'CI_RUN') {
            cy.exec('mongo bf --host localhost:27017 --eval "db.dropDatabase();"');
            // wipping the db also wipe the indexes we need to recreate thoses
            cy.exec('mongo bf --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"');
            cy.wait(1000);
        }
        cy.waitForResolve(Cypress.env('baseUrl'));
    });


    after(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'trial', 'en');
    });

    it('Should create projects when completing the initial setup', () => {
        cy.visit('/');
        cy.url().should('contain', '/setup/welcome');
        cy.get('[data-cy=start-setup]').click();

        cy.get('#uniforms-0001-0001').type('Testing');
        cy.get('#uniforms-0001-0003').type('McTest');
        cy.get('#uniforms-0001-0005').type('test@test.com');
        cy.get('#uniforms-0001-0007').type('aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('aaaaaaa{enter}');

        cy.contains('The passwords are not matching');
        cy.contains('Your password should contain at least');

        cy.get('#uniforms-0001-0007').type('{selectall}{del}Aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('{selectall}{del}Aaaaaaaa00{enter}');

        cy.get('[data-cy=account-step]').click();
        cy.contains('Create').click();


        cy.wait(5000);
        cy.url({ timeout: 30000 }).should('include', '/admin/projects');
    });
}); */

describe('Initial setup', () => {
    before(() => {
        cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.dropDatabase();"')
        .its('stdout').should('contain', '{ "ok" : 1 }')
        cy.exec('docker exec botfront-mongo mongo bf --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"')
        .its('stdout').should('contain', '{\n\t"numIndexesBefore" : 1,\n\t"numIndexesAfter" : 2,\n\t"createdCollectionAutomatically" : true,\n\t"ok" : 1\n}')
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
        cy.get('#uniforms-0001-0001').type('Test')
        cy.get('#uniforms-0001-0003').type('Tester')
        cy.get('#uniforms-0001-0005').type('test@test.com')
        cy.get('#uniforms-0001-0007').type('Test1234!')
        cy.get('#uniforms-0001-0009').type('Test1234!')
        cy.get('[data-cy="account-create-button"]').click()
    })

    it('Create project', () => {
        cy.deleteProject('chitchat-*')
        cy.createProject('bf', 'testing', 'en')
    })
})