describe('auto-assignment of canonical status in the nlu editor', () => {
    beforeEach(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping' });
        cy.import('bf', 'nlu_sample_en.yml', 'en');
        //cy.train();
    });
    //afterEach(() => {
    //    cy.deleteProject('bf');
    //});
    
    
    it('should set the first example to canonical and refresh the story editor', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('I will go shopping').type('{enter}');

        cy.dataCy('icon-gem').last().should('have.class', 'black');
        cy.dataCy('icon-gem').last().click();
        cy.wait(200);
        cy.dataCy('icon-edit').last().should('not.have.class', 'disabled');
        cy.dataCy('icon-gem').last().should('not.have.class', 'black');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(10000);
        cy.contains('I will go shopping').should('exist');

        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-edit').click({ force: true });
        cy.dataCy('example-editor-container').find('[data-cy=example-text-editor-input]').type(' edited{enter}');

        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(10000);
        cy.contains('I will go shopping edited').should('exist');

        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').click({ force: true });
        cy.dataCy('nlu-modification-label').contains('deleted').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(1000);
        cy.dataCy('utterance-text').children('span').should('not.exist');
    });

    it('should set the first example to canonical and refresh the story editor when trained model predicts a different intent first', () => {
        cy.visit('/project/bf/dialogue');
        cy.train();
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('hi').type('{enter}');
        cy.get('.row'); // wait for the row to appear
        cy.dataCy('icon-gem').should('not.exist');
        cy.dataCy('nlu-editor-modal').find('[data-cy=intent-label]').last().click();
        cy.dataCy('intent-dropdown').find('.intent-label').contains('shopping').click();

        cy.dataCy('icon-gem').should('have.class', 'black');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(1000);
        cy.contains('hi').should('exist');
    });

    it('should set the first example to canonical and refresh the story editor', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').focus();
        cy.dataCy('example-text-editor-input').fill('I will go shopping');
        cy.dataCy('example-text-editor-input').type('{enter}');
        cy.dataCy('intent-label').last().click();
        cy.wait(1000);
        cy.dataCy('intent-label').last().click();
        cy.wait(1000);
        cy.dataCy('intent-dropdown').find('input').type('shopping{enter}')
        cy.dataCy('icon-gem').first().should('have.class', 'grey');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(1000);
        cy.contains('I will go shopping').should('exist');
    });
});