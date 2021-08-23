import { expect } from "chai";

/* global cy:true */
const token = Cypress.env('REST_API_TOKEN');

const endpoint = '/api/projects';
const name = 'testproject';
const nameSpace = 'bf-test'
const baseUrl = 'http://test';

describe('projects endpoint basic functionality', () => {

  it('it should respond with error missing token', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
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
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('should respond with malformed or missing inputs', () => {

    // missing baseUrl
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, nameSpace},
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // missing nameSpace
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, baseUrl},
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // missing name
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { nameSpace, baseUrl},
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });


    // malformed baseUrl
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, nameSpace, baseUrl: 'test'},
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // malformed nameSpace
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, baseUrl, nameSpace: 'test'},
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // malformed name
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { nameSpace, baseUrl}, name: '134-qwd_',
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('Create valid project with generated id', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, nameSpace, baseUrl },
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('projectId');
    });
  });

  it('Create valid project with fixed id', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      headers: { Authorization: token },
      body: { name, nameSpace, baseUrl, id: 'test-id-fixed-1' },
      failOnStatusCode: false
    })
    .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('projectId');
      expect(res.body.projectId).to.eq('test-id-fixed-1');
    });
  });
});
