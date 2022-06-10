describe('Analytics cards', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
    })

    beforeEach(() => {
        cy.login()
        cy.visit('/project/bf/analytics')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    it('Export button should not be visible when no data is loaded', () => {
        cy.dataCy('no-data-message').should('exist')
        cy.dataCy('analytics-export-button').should('not.exist')
    })

    it('Persist analytics cards settings', () => {
        cy.dataCy('table-chart-button').eq(0).should('not.have.class', 'selected')
        cy.dataCy('table-chart-button').eq(0).click()
        cy.dataCy('table-chart-button').eq(0).should('have.class', 'selected')
        cy.visit('/project/bf/analytics')
        cy.dataCy('table-chart-button').eq(0).should('have.class', 'selected')
    })

    it('Add a new card, rename and delete it', () => {
        cy.dataCy('analytics-card').should('have.length', 7)
        cy.dataCy('create-card').click()
        cy.dataCy('create-card').find('div.item').eq(0).click()
        cy.dataCy('analytics-card').should('have.length', 8)
        cy.dataCy('analytics-card').first().find('.title').dblclick()
        cy.dataCy('analytics-card').first().find('input').clear().type('New card{enter}', { force: true })
        cy.dataCy('analytics-card').first().find('.title').should('contain.text', 'New card')
        cy.dataCy('analytics-card').first().dragTo('delete-card-dropzone')
        cy.dataCy('analytics-card').should('have.length', 7)
    })

    it('Change a single card\'s or every card\'s date range', () => {
        const firstDate = Cypress.dayjs().date(1).month(3).format('D/M/YYYY')
        const secondDate = Cypress.dayjs().date(2).month(3).format('D/M/YYYY')

        //Dates had to be formatted again for verifying correct length
        const formattedFirstDate = Cypress.dayjs().date(1).month(3).format('DD/MM/YYYY')
        const formattedSecondDate = Cypress.dayjs().date(2).month(3).format('DD/MM/YYYY')

        cy.dataCy('analytics-card').should('have.length', 7)
        cy.pickDateRange(0, firstDate, secondDate, false)
        cy.dataCy('date-picker-container', formattedFirstDate + ' - ' + formattedSecondDate).should('have.length', 1)
        cy.pickDateRange(0, firstDate, secondDate, true)
        cy.dataCy('date-picker-container', formattedFirstDate + ' - ' + formattedSecondDate).should('have.length', 7)
    })
})
