const dateNow = Cypress.dayjs().format('D/M/YYYY')
const dateYesterday = Cypress.dayjs().subtract(1, 'day').format('D/M/YYYY')
const timestamp = Cypress.dayjs().startOf('date').unix()

const ExpectedCellData = {
    conversationLength: [
        {
            table: 1, row: 0, column: 0, contents: 2,
        },
        {
            table: 1, row: 0, column: 1, contents: 1,
        },
        {
            table: 1, row: 0, column: 2, contents: '100.00%',
        }
    ],
    topIntents: [
        {
            table: 2, row: 0, column: 0, contents: 'intent_dummy',
        },
        {
            table: 2, row: 0, column: 1, contents: 1,
        },
        {
            table: 2, row: 0, column: 2, contents: '50.00%',
        },
        {
            table: 2, row: 1, column: 0, contents: 'chitchat.greet',
        },
        {
            table: 2, row: 1, column: 1, contents: 1,
        },
        {
            table: 2, row: 1, column: 2, contents: '50.00%',
        }
    ],
    conversationDuration: [
        {
            table: 3, row: 0, column: 0, contents: '< 30',
        },
        {
            table: 3, row: 0, column: 1, contents: 1,
        },
        {
            table: 3, row: 0, column: 2, contents: '100.00%',
        }
    ],
    fallbackHourly: [
        {
            table: 4, row: 0, column: 0, contents: '00:00 - 00:59',
        },
        {
            table: 4, row: 0, column: 1, contents: 0,
        },
        {
            table: 4, row: 0, column: 2, contents: 1,
        },
        {
            table: 4, row: 0, column: 3, contents: '0.00%',
        },
        {
            table: 4, row: 1, column: 0, contents: '01:00 - 01:59',
        },
        {
            table: 4, row: 1, column: 1, contents: 0,
        },
        {
            table: 4, row: 1, column: 2, contents: 0,
        },
        {
            table: 4, row: 1, column: 3, contents: '0.00%',
        },
    ],

    VisitsHourly: [
        {
            table: 0, row: 0, column: 0, contents: '00:00 - 00:59',
        },
        {
            table: 0, row: 0, column: 1, contents: 1,
        },
        {
            table: 0, row: 0, column: 2, contents: 1,
        },
        {
            table: 0, row: 0, column: 3, contents: '100.00%',
        },
        {
            table: 0, row: 1, column: 0, contents: '01:00 - 01:59',
        },
        {
            table: 0, row: 1, column: 1, contents: 0,
        },
        {
            table: 0, row: 1, column: 2, contents: 0,
        },
        {
            table: 0, row: 1, column: 3, contents: '0.00%',
        },
    ],
}

describe('Analytics tables', () => {
    before(() => {
        cy.login()
        cy.deleteProject('bf')
        cy.createProject('bf', 'My Project', 'en')
        cy.setTimezoneOffset()
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', {startTime: timestamp})
        cy.addConversationFromTemplate('bf', 'action_test', 'intenttest', {startTime: timestamp})
    })

    beforeEach(() => {
        cy.login()
        cy.visit('/project/bf/analytics')
    })

    after(() => {
        cy.deleteProject('bf')
    })

    const verifyCellData = ({
        table, column, row, contents,
    }) => {
        cy.dataCy('analytics-chart')
            .eq(table)
            .find('.rt-tr-group')
            .eq(row)
            .find('.rt-td')
            .eq(column)
            .contains(contents)
            .should('exist')
    }
    const selectTableChart = (cardIndex) => {
        cy.dataCy('table-chart-button')
            .eq(cardIndex)
            .click()
    }
    const exportCard = (index) => {
        cy.dataCy('card-ellipsis-menu').eq(index).click()
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=export-card]')
            .click({ force: true })
    }
    it('Display the correct data in the conversation length table', () => {
        selectTableChart(1)
        ExpectedCellData.conversationLength.forEach((cellData) => {
            verifyCellData(cellData)
        })
        // export and check that the page does not crash
        exportCard(1)
        cy.dataCy('analytics-chart').should('exist')
    })

    it('Display the correct data in the top 10 intents  table', () => {
        selectTableChart(2)
        ExpectedCellData.topIntents.forEach((cellData) => {
            verifyCellData(cellData)
        })
        // RE-ENABLE THIS TEST WHEN NULL INTENT IS REMOVED
        cy.dataCy('analytics-chart')
            .find('.rt-td')
            .each((element) => {
                cy.expect(element[0].childNodes[0].data.length).not.to.be.equal(0)
            })
        // export and check that the page does not crash
        exportCard(2)
        cy.dataCy('analytics-chart').should('exist')
    })

    it('Display the correct data in the conversation duration table', () => {
        selectTableChart(3)
        ExpectedCellData.conversationDuration.forEach((cellData) => {
            verifyCellData(cellData)
        })
        // export and check that the page does not crash
        exportCard(3)
        cy.dataCy('analytics-chart').should('exist')
    })
    
    it('Display the correct data in the fallback table', () => {
        cy.pickDateRange(4, dateNow, dateNow)
        selectTableChart(4)
        ExpectedCellData.fallbackHourly.forEach((cellData, index) => {
            cy.log(`verifiedDataStep ${index} (fallback)`)
            verifyCellData(cellData)
        })
        exportCard(4)
        cy.dataCy('analytics-chart').should('exist')
    })

    it('Display the correct data in the engagement table', () => {
        cy.pickDateRange(0, dateNow, dateNow)
        selectTableChart(0)
        ExpectedCellData.VisitsHourly.forEach((cellData, index) => {
            cy.log(`verify cell data ${index} (engagement)`)
            verifyCellData(cellData)
        })
        // export and check that the page does not crash
        exportCard(0)
        cy.dataCy('analytics-chart').should('exist')
    })

    it('Export a xlsx file with all the widgets data', () => {
        cy.pickDateRange(0, dateYesterday, dateNow, true)
        cy.dataCy('export-all').click({ force: true })
        cy.getWindowMethod('getXLSXData').then((getXLSXData) => {
            const excelData = getXLSXData()
            expect(excelData).to.be.an('object').that.is.not.empty
        })
    })
})
