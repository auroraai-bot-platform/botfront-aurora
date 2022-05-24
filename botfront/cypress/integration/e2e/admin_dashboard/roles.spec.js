const roleName = 'TestRole'
const roleDesc = 'description of test role'
const permission = 'nlu-data:w'
const editedRoleName = 'NewRole'

describe('Role management', () => {
    before(() => {
        cy.login()
        cy.deleteUser('roleTestUser@test.test')
        cy.deleteRole(editedRoleName, 'global-admin')
        cy.deleteRole(roleName, 'global-admin')
        cy.createRole(roleName, roleDesc, [permission])
        cy.createUser('roleTestUser', 'roleTestUser@test.test', [roleName], 'bf')
    })

    beforeEach(() => {
        cy.login()
        cy.visit('/admin/roles')
        cy.get('.-btn').contains('Next').click()
    })

    after(function() {
        cy.deleteUser('roleTestUser@test.test')
        cy.deleteRole(editedRoleName, 'global-admin')
        cy.deleteRole(roleName, 'global-admin')
    })

    it('Verify new role was created', () => {
        cy.dataCy('role-link').contains(roleName).click()
        cy.dataCy('role-name-input').find('input').should('have.value', roleName)
        cy.dataCy('role-description-input').find('input').should('have.value', roleDesc)
        cy.dataCy('role-children-dropdown').find('.ui.label').contains(permission).should('exist')
    })

    it('Edit role', () => {
        cy.dataCy('role-link').contains(roleName).click()
        cy.dataCy('role-name-input').find('input').clear().type(editedRoleName)
        cy.dataCy('save-button').click()
        cy.dataCy('save-button').should('have.text', 'Saved')
    })

    it('Verify the role was not duplicated', () => {
        cy.dataCy('role-link').contains(roleName).should('not.exist')
        cy.dataCy('role-link').contains(editedRoleName).should('exist')
    })

    it('Delete role', () => {
        cy.dataCy('role-link').contains(editedRoleName).should('exist').click()
        cy.dataCy('delete-role').click()
        cy.dataCy('select-fallback-role').click()
        cy.dataCy('select-fallback-role').find('.text').contains('global-admin').click()
        cy.dataCy('delete-role-modal').find('.ui.negative.button').contains('Delete').click()
    })

    it('Verify user role was changed to the fallback role', () => {
        cy.dataCy('role-link').contains(roleName).should('not.exist')
        cy.visit('/admin/users')
        cy.dataCy('edit-user').last().click()
        cy.dataCy('user-roles-field').find('.label').contains('global-admin').should('exist')
    })
})
