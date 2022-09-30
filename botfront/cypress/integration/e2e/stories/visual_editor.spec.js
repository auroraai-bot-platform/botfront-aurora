describe('Story visual editor', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en').then(
            () => cy.createNLUModelProgramatically('bf', '', 'de'),
        )
        cy.import('bf', 'nlu_sample_en.json', 'en')
        cy.visit('/project/bf/dialogue')
        cy.createStoryGroup()
        cy.createFragmentInGroup()
    })

    afterEach(() => {
        cy.deleteProject('bf')
    })

    const writeStoryWithIntent = (intent) => {
        cy.dataCy('toggle-yaml').click({ force: true })
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type(`- intent: ${intent}`, { force: true })
            .blur()
        cy.dataCy('toggle-visual').click({ force: true })
    };
    
    it('persist a user utterance, a bot response, and display add-user-line option appropriately', () => {
        cy.train()
        cy.browseToStory('Groupo (1)')

        cy.dataCy('add-user-line').click({ force: true })
        cy.dataCy('user-line-from-input').last().click({ force: true })
        cy.addUserUtterance('hello !', 'chitchat.greet', 0, { checkForIntent: true })

        cy.contains('hello !') // checks that text has been saved

        cy.dataCy('add-user-line').should('not.exist') // cannot have adjacent user utterances
        cy.dataCy('add-bot-line').click({ force: true })

        cy.dataCy('from-text-template').click({ force: true })
        cy.get('.story-line').should('have.length', 2)
        cy.dataCy('bot-response-input').find('textarea').should('be.empty')

        cy.dataCy('bot-response-input').find('textarea').clear().type('I do too.')

        cy.get('[agent=bot]').should('have.length', 1) // ensure that enter do not create a new response

        cy.dataCy('add-user-line').should('exist') // would not lead to adjacent user utterances

        cy.dataCy('add-bot-line').click({ force: true })
        cy.contains('I do too.') // checks that text has been saved
        cy.dataCy('from-qr-template').click({ force: true })
        cy.dataCy('bot-response-input').should('have.length', 2)
        cy.dataCy('bot-response-input').eq(1).find('textarea').clear().type('I do too qr')
        cy.dataCy('bot-response-input').eq(1).find('textarea').blur({ force: true })

        cy.addButtonOrSetPayload('postback option', { payload: { intent: 'get_started' } }, 'button_title')
        cy.addButtonOrSetPayload('web_url option', { url: 'https://myurl.com/' }, 0)

        cy.dataCy('toggle-yaml').click({ force: true })
        cy.dataCy('story-editor').find('.ace_line').eq(0).should('have.text', '- intent: chitchat.greet')
        cy.dataCy('story-editor').find('.ace_line').eq(4).invoke('text')
            .then((response) => {
                cy.visit('/project/bf/responses/')
                cy.get('.rt-tbody > :nth-child(2)')
                    .find('[role=row]')
                    .contains('[role=row]', response.replace('- action:', '').trim())
                    .should('exist') // there's a row with our text and response hash
                    .find('.icon.edit')
                    .click()
                cy.dataCy('postback_option').contains('postback option').should('exist')
                cy.dataCy('web_url_option').contains('web_url option').should('exist')
            })

        cy.visit('/project/bf/nlu/models')
        cy.get('.row').contains('.row', 'hello !').contains('chitchat.greet').should('exist') // there nlu example is there too
    })

    it('click on intent in dropdown to change it', () => {
        cy.browseToStory('Groupo (1)')

        cy.dataCy('add-user-line').click({ force: true })
        cy.dataCy('user-line-from-input').last().click({ force: true })
        cy.dataCy('utterance-input').find('input').type('hello !{enter}')
        cy.dataCy('intent-label').should('have.length', 1)
        cy.dataCy('intent-label').eq(0).click()
        cy.get('.intent-dropdown input').click({ force: true })
        cy.get('.row').contains('chitchat.bye').click()
        cy.dataCy('save-new-user-input').click({ force: true })
        cy.get('.utterances-container').contains('chitchat.bye').should('exist')
    })
    it('rerender on language change', () => {
        cy.browseToStory('Get started')
        cy.dataCy('bot-response-input').find('textarea').type('I agree let\'s do it!!').blur()

        cy.dataCy('language-selector').click().find('div').contains('German').click({ force: true })
        cy.contains('Let\'s get started!').should('not.exist')
        cy.contains('I agree let\'s do it!!').should('not.exist')

        cy.dataCy('language-selector').click().find('div').contains('English').click({ force: true })
        cy.contains('Let\'s get started!').should('exist')
        cy.contains('I agree let\'s do it!!').should('exist')

        cy.dataCy('language-selector').click().find('div').contains('German').click({ force: true })
        cy.contains('Let\'s get started!').should('not.exist')
        cy.contains('I agree let\'s do it!!').should('not.exist')

        cy.dataCy('language-selector').click().find('div').contains('English').click({ force: true })
        cy.contains('Let\'s get started!').should('exist')
        cy.contains('I agree let\'s do it!!').should('exist')
    })

    it('use the canonical example if one is available', () => {
        cy.insertNluExamples('bf', 'en', [
            {
                text: 'bonjour canonical',
                intent: 'dada',
                metadata: { canonical: true },
            },
            {
                text: 'bonjour not canonical',
                intent: 'dada',
                metadata: { canonical: false },
            },
        ])
        cy.browseToStory('Groupo (1)')
        writeStoryWithIntent('dada')
        cy.get('[role = "application"]').should('have.text', 'bonjour canonical')
    })

    it('use the most recent example if no canonical is available', () => {
        cy.insertNluExamples('bf', 'en', [
            {
                text: 'bonjour not canonical',
                intent: 'dada',
            },
        ], false)
        cy.insertNluExamples('bf', 'en', [
            {
                text: 'bonjour not canonical recent',
                intent: 'dada',
            },
        ], false)
        cy.browseToStory('Groupo (1)')
        writeStoryWithIntent('dada')
        cy.get('[role = "application"]').should('have.text', 'bonjour not canonical recent')
    })

    it('add user utterance payload disjuncts, delete them, and YAML representation should match', () => {
        cy.browseToStory('Greetings', 'Example group')
        cy.dataCy('icon-add').click({ force: true })
        cy.dataCy('user-line-from-input').first().click({ force: true })
        cy.addUserUtterance('Bye', 'chitchat.bye', 1)
        cy.dataCy('toggle-yaml').click()
        cy.dataCy('story-editor').should('contain.text', 'or:')
            .should('contain.text', 'intent: chitchat.greet')
            .should('contain.text', 'intent: chitchat.bye')
        cy.dataCy('toggle-visual').click()
        cy.dataCy('icon-trash').first().click({ force: true })
        cy.dataCy('toggle-yaml').click()
        cy.dataCy('story-editor').should('not.contain.text', 'or:')
            .should('not.contain.text', 'intent: chitchat.greet')
            .should('contain.text', 'intent: chitchat.bye')
    })

    it('do not add utterance payload disjunct if some disjunct already has identical payload', () => {
        cy.browseToStory('Greetings', 'Example group')
        cy.dataCy('intent-label').should('have.length', 1)
        cy.dataCy('icon-add').click({ force: true })
        cy.dataCy('user-line-from-input').first().click({ force: true })
        cy.addUserUtterance('Hello', 'chitchat.greet', 1)
        cy.dataCy('intent-label').should('have.length', 1)
    })
})
