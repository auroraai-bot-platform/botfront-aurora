describe('Story permissions', () => {
    before(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('/project/bf/dialogue')
        cy.createStoryGroup()
        cy.createFragmentInGroup()
        cy.dataCy('create-branch').click({ force: true })
        cy.dataCy('slots-modal').click()
        cy.dataCy('add-slot').click()
        cy.contains('float').click()
        cy.dataCy('new-slot-editor').find('input').first().type('test')
        cy.dataCy('save-button').click()
        cy.createForm('bf', 'example_form', {
            slots: ['test'],
        })
        cy.createDummyRoleAndUser({ permission: ['stories:r'] })
    })

    beforeEach(() => {
        cy.login({ admin: false })
        cy.visit('/project/bf/dialogue')
    })

    after(() => {
        cy.removeDummyRoleAndUser()
        cy.deleteProject('bf')
    })

    it('editing buttons/icons should not exist', () => {
        cy.browseToStory('Groupo (1)')
        cy.dataCy('story-title').should('exist') // check that the page was properly loaded
        cy.dataCy('single-story-editor').first().trigger('mouseover')
        cy.dataCy('icon-trash').should('not.exist')
        cy.dataCy('icon-add').should('not.exist')
        cy.dataCy('add-item-to-group').should('not.exist')
        cy.dataCy('add-item').should('have.class', 'disabled')
        cy.get('.item-actions').children().should('have.length', 0)
        cy.get('.item-name').should('have.class', 'uneditable')
        cy.get('.drag-handle').should('have.class', 'hidden')
        cy.dataCy('delete-branch').should('not.exist')
    })

    it('editing story title should not be possible', () => {
        cy.browseToStory('Groupo (1)')
        cy.dataCy('story-title').should('be.disabled')
    })

    it('editing branch name should not be possible', () => {
        cy.browseToStory('Groupo (1)')
        cy.dataCy('story-title').should('exist') // check that the page was properly loaded
        cy.dataCy('branch-label').eq(1).click()
        cy.get('[data-cy=branch-label] input').eq(1).should('exist')
        cy.get('[data-cy=branch-label] input').should('be.disabled')
    })

    it('editing slots should not be possible', () => {
        cy.browseToStory('Groupo (1)')
        cy.dataCy('story-title').should('exist') // check that the page was properly loaded
        cy.dataCy('slots-modal').click()
        cy.get('form.form .field').each((elm) => {
            cy.wrap(elm).should('have.class', 'disabled')
        })
        cy.dataCy('save-button').should('not.exist')
        cy.dataCy('delete-slot').should('not.exist')
    })

    it('editing story yaml should not be possible', () => {
        cy.browseToStory('Get started')
        cy.dataCy('toggle-yaml').click()
        cy.dataCy('story-editor').get('textarea').first().focus().type('Test', { force: true }).blur()
        cy.get('div.ace_content').should(
            'contain.text',
            '- intent: get_started',
        ).should('not.contain.text', 'Test')
    })

    it('editing nlu data from the modal should not be possible', () => {
        cy.browseToStory('Greetings')
        cy.dataCy('utterance-text').click()
        cy.dataCy('close-nlu-modal').should('exist')
        cy.dataCy('save-nlu').should('not.exist')
        cy.dataCy('cancel-nlu-changes').should('not.exist')
        cy.dataCy('example-text-editor-input').should('not.exist')
    })
})
