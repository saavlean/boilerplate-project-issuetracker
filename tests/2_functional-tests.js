const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {

  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test Text',
        created_by: 'Tester',
        assigned_to: 'Assignee',
        status_text: 'In Progress'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Title');
        assert.equal(res.body.issue_text, 'Test Text');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Assignee');
        assert.equal(res.body.status_text, 'In Progress');
        assert.isTrue(res.body.open);
        assert.exists(res.body._id);
        testId = res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Required Only',
        issue_text: 'Only required fields',
        created_by: 'Tester'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required Only');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        assert.exists(res.body._id);
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({ issue_title: 'Missing fields' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject')
      .query({ open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => assert.isTrue(issue.open));
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject')
      .query({ open: true, created_by: 'Tester' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({ _id: testId, issue_title: 'Updated Title' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({ _id: testId, issue_title: 'Multi Update', issue_text: 'Updated text' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({ issue_title: 'No ID' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({ _id: 'invalidid123', issue_title: 'Bad ID' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({ _id: 'invalidid123' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});