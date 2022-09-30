describe('NLU editor modal tests', () => {
    const cancelChanges = () => {
        cy.dataCy('cancel-nlu-changes').click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
    };
    
    beforeEach(() => {
        cy.login();
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en')
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping', entities: [{ value: 'costco', name: 'shop' }] });
        cy.import('bf', 'nlu_entity_sample.json', 'en');
        cy.train();
    });
    
    afterEach(() => {
        cy.deleteProject('bf');
    });

    it('should be able to add, edit, toggle canonical and delete examples through the nlu modal', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').should('have.class', 'black');
        cy.dataCy('icon-gem').click({ force: true });
        cy.dataCy('icon-gem').should('have.class', 'grey');
        cy.get('.row').trigger('mouseover');
        cy.dataCy('icon-edit').should('exist'); // check appear on hover works correctly
        cy.dataCy('icon-edit').click({ force: true });
        cy.dataCy('example-editor-container').find('[data-cy=example-text-editor-input]').type(' tonight{enter}');
        cy.dataCy('example-text-editor-input').click().type('I will go to costco{enter}');
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(400);
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=utterance-text]').should('have.length', 3); // one extra from the header
        cy.dataCy('utterance-text').find('span').contains('I am going to').should('exist');
        cy.dataCy('utterance-text').contains('I will go to').should('exist');
    });
    it('should not be able to save changes when there is an invalid example', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
        cy.dataCy('save-nlu').should('have.class', 'disabled');
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click({ force: true });
        cy.dataCy('save-nlu').should('not.have.class', 'disabled');
    });
    it('should create multiple examples when pasting multiple lines', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('Hello jim\nI will go to costco').type('{enter}');
        cy.dataCy('nlu-editor-modal').find('[data-cy=intent-label]').should('have.length', 4);
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
    });
    it('should show a popup on Cancel when any change has been made', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('I will go to costco{enter}');
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click({ force: true });
        cy.dataCy('nlu-modification-label').contains('deleted').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('icon-edit').first().click({ force: true });
        cy.dataCy('example-editor-container').find('[data-cy=example-text-editor-input]').type(' tonight{enter}');
        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('icon-gem').first().should('have.class', 'grey');
        cancelChanges();
    });
    it('should modify canonical', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().should('have.class', 'black');

        cy.dataCy('example-text-editor-input').click().type('I will probably go to costco{enter}');
        cy.dataCy('nlu-editor-modal').find('[data-cy=intent-label]').should('have.length', 3);
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(300);
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem', null, '.grey').click({ force: true });
        cy.dataCy('icon-gem', null, '.black').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.wait(1000);
        cy.dataCy('utterance-text').contains('I will probably go to').should('exist');
    });
});
