/* global cy:true */
const token = Cypress.env('REST_API_TOKEN');

const endpoint = 'http://localhost:3030/api/users';
const email = 'test@example.org';
const password = 'Aaaaaaaa00';


describe('users endpoint basic functionality', () => {
  before(() => {
    cy.deleteUser(email);
  });

  after(() => {
    cy.deleteUser(email);
  });

  it('it should respond with error missing token', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      failOnStatusCode: false
    })
    .as('users');

    cy.get('@users').should((res) => {
      expect(res.status).to.eq(403);
    });
  });

  it('should respond with error invalid json', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
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
      headers: { Authorization: token },
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
      headers: { Authorization: token },
      body: { email, password },
      failOnStatusCode: false
    })
    .should((res) => {
      expect(res.status).to.eq(200);
    });

    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { email, password },
      failOnStatusCode: false
    })
    .should((res) => {
      expect(res.status).to.eq(500);
    });
  });
});