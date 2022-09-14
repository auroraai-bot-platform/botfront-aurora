describe('Project widget settings', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'fr')
        cy.visit('/project/bf/settings')
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    it('can be saved', () => {
        cy.contains('Chat widget').click()
        cy.dataCy('widget-title').type('-test')
        cy.get('input.search').click()
        cy.dataCy('widget-form').find('div[role=option]').click()
        cy.dataCy('lang-select').find('div.text').should('have.text', 'French')
        cy.get('[data-cy=save-button]').click()
        cy.get('[data-cy=changes-saved]').should('exist')
        cy.contains('Project Info').click()
        cy.contains('Chat widget').click()
        cy.get('[data-cy=widget-title] > .ui.input > input').should('have.value', 'My Project-test')
        cy.dataCy('lang-select').find('div.text').should('have.text', 'French')
    })

    it('install should not have env selector with one env', () => {
        cy.contains('Chat widget').click()
        cy.dataCy('install').click()
        cy.dataCy('envs-selector').should('not.exist')
    })

    it('install should have env selector with more env', () => {
        cy.get('[data-cy=deployment-environments]').children().contains('production').click()
        cy.get('[data-cy=save-changes]').click()
        cy.visit('/project/bf/settings')
        cy.contains('Chat widget').click()
        cy.dataCy('install').click()
        cy.dataCy('envs-selector').should('exist')
    })

    it('display the installation tab with the webchat Plus channel', () => {
        cy.contains('Credentials').click()
        cy.get('[data-cy=ace-field]').click()
        cy.get('textarea').type('{selectAll}{del}rasa_addons.core.channels.webchat_plus.WebchatPlusInput:{enter}  session_persistence: true{enter}base_url: \'http://localhost:5005\'')
        cy.get('[data-cy=save-button]').click()
        cy.get('[data-cy=changes-saved]').should('be.visible')
        cy.contains('Chat widget').click()
        cy.dataCy('install').click()
        cy.dataCy('envs-selector').should('not.exist')
        cy.dataCy('copy-webchat-snippet')
    })
})
