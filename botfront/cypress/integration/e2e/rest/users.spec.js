const endpoint = 'http://localhost:3030/api/users';
const email = 'test@example.org';
const password = 'Aaaaaaaa00';


describe('users endpoint basic functionality', () => {
  before(() => {
    cy.deleteUser(email);
  });

  it('should respond with error invalid json', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: 'test',
      failOnStatusCode: false
    })
    .as('users');

    cy.get('@users').should((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('Create valid user', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { email, password },
      failOnStatusCode: false
    })
    .as('users');

    cy.get('@users').should((res) => {
      expect(res.status).to.eq(200);
    });
  });
});

describe('users endpoint fails on duplicate', () => {

  before(() => {
    cy.deleteUser(email);
  });

  after(() => {
    cy.deleteUser(email);
  });

  it('should fail on second request', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { email, password },
      failOnStatusCode: false
    })
    .should((res) => {
      expect(res.status).to.eq(200);
    });

    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { email, password },
      failOnStatusCode: false
    })
    .should((res) => {
      expect(res.status).to.eq(500);
    });
  });
});