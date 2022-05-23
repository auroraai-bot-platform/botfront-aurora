describe('User management', function () {
    before(() => {
        cy.login()
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en')
        cy.deleteUser('test_users@bf.com');
        cy.deleteUser('test@test.test');
//        cy.createDummyRoleAndUser({ permission: ['global-admin'] });
        cy.createUser('Tester', 'test@test.test', 'global-admin', 'bf')
    })

    beforeEach(function () {
        cy.login();
        cy.visit('/admin/users')
    });

    after(function () {
        cy.deleteUser('test_users@bf.com');
        cy.deleteUser('test@test.test');
        cy.deleteProject('bf');
    });

    it('Create user', function () {
        cy.dataCy('new-user').should('exist');
        cy.dataCy('new-user').click();
        cy.get('input[name="profile.firstName"]').type('Testing');
        cy.get('input[name="profile.lastName"]').type('Users');
        cy.get('input[name="email"]').type('test_users@bf.com');
        cy.dataCy('preferred-language').click();
        cy.dataCy('preferred-language').find('.item').contains('English').click();
        cy.get('.search').contains('Select a project').click();
        cy.get('.item').contains('GLOBAL').click({force: true});
        cy.get('.search').contains('Select roles').click();
        cy.get('.item').contains('global-admin').click();
        cy.get('.ui.checkbox').find('[type="checkbox"]').check({force: true})
        cy.get('.ui.form').find('.ui.primary.button').click();
    });

    it.only('Edit user', function () {
        cy.wait(2000)
        cy.get('.rt-td').contains('a', 'Tester').should('exist');
        cy.dataCy('edit-user').last().click();
        cy.get('input[name="profile.lastName"]').clear().type('EditTester');
        cy.dataCy('save-user').click()
        cy.wait(2000)
        cy.get('.rt-td').contains('a', 'EditTester').should('exist');
    });

    it('Delete user', function () {
        cy.wait(2000)
        cy.dataCy('edit-user').eq(1).click();
        cy.contains('User deletion').click();
        cy.get('.negative.button').click();
        cy.get('.ui.primary.button').contains('OK').click()
        cy.get('.rt-td').contains('DeleteTester').should('not.exist');
    });
});
