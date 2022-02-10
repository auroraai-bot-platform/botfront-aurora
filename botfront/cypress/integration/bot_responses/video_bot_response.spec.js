/* global cy:true */

const videoUrlA = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const videoUrlB = 'https://www.youtube.com/watch?v=HEXWRTEbj1I';

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should create a custom response using the response editor', function() {
        cy.createResponseFromResponseMenu('video', 'test_A');
        cy.setVideo(videoUrlA);
        cy.escapeModal();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').find('img').should('have.attr', 'src').and('include.text', 'youtube');
    });
    it('should add and edit video variations', function() {
        cy.createResponseFromResponseMenu('video', 'test_A');
        cy.setVideo(videoUrlA);
        cy.dataCy('add-variation').click();
        cy.setVideo(videoUrlB, 1);
        cy.escapeModal();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src')
            .and('include.text', 'youtube');
        cy.dataCy('response-text').find('img').last().should('have.attr', 'src')
            .and('include.text', 'youtube');
        
        cy.log('Edit variation');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('icon-trash').first().click();
        cy.dataCy('icon-trash').first().click();
        cy.setVideo(videoUrlB, 1); // the first one is outside modal :'(
        cy.escapeModal();
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src')
            .and('have.attr', 'youtube');
        cy.dataCy('response-text').find('img').should('have.length', 1);
    });
    it('should provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-video-template').click({ force: true });
        cy.dataCy('language-selector').click().find('div').contains('French')
            .click({ force: true });
        cy.dataCy('video-container').should('exist');
    });
});
