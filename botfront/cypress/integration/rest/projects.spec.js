import { expect } from "chai";

/* global cy:true */
const apiUrl = 'http://localhost:3030/api';
const name = 'testproject';
const nameSpace = 'bf-test'
const baseUrl = 'http://localhost:5005';
const host = baseUrl;
const actionEndpoint = baseUrl;
const token = '1234';

const fixedProjectId = 'test-id-1234';

describe('/api/projects endpoint', () => {
  const endpoint = `${apiUrl}/projects`;


  let generatedProjectId;

  before(() => {
    cy.deleteProject(fixedProjectId);
  });

  after(() => {
    cy.deleteProject(generatedProjectId);
  });

  it('should respond with error invalid json', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
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
      body: { name, nameSpace, host, token,  baseUrl },
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
      body: { name, baseUrl },
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
      body: { nameSpace, baseUrl },
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
      body: { name, nameSpace, baseUrl: 'test' },
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
      body: { name, baseUrl, nameSpace: 'test' },
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
      body: { nameSpace, baseUrl, name: '134-qwd_' },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // malformed projectId
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { nameSpace, baseUrl, name, projectId: 1 },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });

    // 0 length projectId
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { nameSpace, baseUrl, name, projectId: '' },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('should create a valid project with a generated id', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { name, nameSpace, baseUrl, host, token, actionEndpoint },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should(async (res) => {
      generatedProjectId = res.body.projectId;
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('projectId');
    });

  });

  it('should create a valid project with a fixed id', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { name, nameSpace, baseUrl, host, token, actionEndpoint, projectId: fixedProjectId },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('projectId');
      expect(res.body.projectId).to.eq(fixedProjectId);
    });

  });

  it('should create a valid project with a fixed id and prod config', () => {
    cy.request({
      url: endpoint,
      method: 'PUT',
      body: { name, nameSpace, baseUrl, host, token, actionEndpoint, projectId: fixedProjectId, prodBaseUrl: baseUrl, prodHost: host, prodToken: token, prodActionEndpoint: actionEndpoint },
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('projectId');
      expect(res.body.projectId).to.eq(fixedProjectId);
    });

  });

});




describe('/api/projects/import endpoint', () => {
  const endpoint = `${apiUrl}/projects/import`;

  it('should respond with error missing projectId', () => {

    cy.request({
      url: endpoint,
      method: 'POST',
      failOnStatusCode: false
    })
      .as('projects');

    cy.get('@projects').should((res) => {
      expect(res.status).to.eq(400);
    });
  });


  // MAKE SURE RASA CONTAINER WITH CORRECT PROJECTID IS RUNNING WHEN RUNNING THIS TEST SEPARATELY
  it('should import a valid rasa zip file into a project with a fixed project id', () => {
    const alias = 'importRequest';

    // build a form data object, that holds the projectId and the zip file
    const data = new FormData();

    data.set("projectId", fixedProjectId);

    cy.fixture('bot.zip', "binary")
      .then((binary) => Cypress.Blob.binaryStringToBlob(binary, 'application/zip'))
      .then((blob) => {
        data.append("file", blob);
        cy.request({
          url: endpoint,
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
          form: false,
          failOnStatusCode: false
        })
          .then((res) => {
            expect(res.status).to.eq(200);
          });
      });
  });
});