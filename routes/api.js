'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB);

const issueSchema = new mongoose.Schema({
  project:     { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text:  { type: String, required: true },
  created_by:  { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  open:        { type: Boolean, default: true },
  created_on:  { type: Date, default: Date.now },
  updated_on:  { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(async function(req, res) {
      const project = req.params.project;
      const filter = Object.assign({ project }, req.query);
      try {
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch(e) {
        res.json({ error: 'could not get issues' });
      }
    })

    .post(async function(req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || ''
        });
        const saved = await issue.save();
        res.json({
          _id:         saved._id,
          issue_title: saved.issue_title,
          issue_text:  saved.issue_text,
          created_by:  saved.created_by,
          assigned_to: saved.assigned_to,
          status_text: saved.status_text,
          open:        saved.open,
          created_on:  saved.created_on,
          updated_on:  saved.updated_on
        });
      } catch(e) {
        res.json({ error: 'required field(s) missing' });
      }
    })

    .put(async function(req, res) {
      const { _id, ...fields } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      const updates = {};
      ['issue_title','issue_text','created_by','assigned_to','status_text','open'].forEach(f => {
        if (fields[f] !== undefined && fields[f] !== '') updates[f] = fields[f];
      });

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updates.updated_on = new Date();

      try {
        const updated = await Issue.findByIdAndUpdate(_id, updates, { returnDocument: 'after' });
        if (!updated) return res.json({ error: 'could not update', _id });
        res.json({ result: 'successfully updated', _id });
      } catch(e) {
        res.json({ error: 'could not update', _id });
      }
    })

    .delete(async function(req, res) {
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });
        res.json({ result: 'successfully deleted', _id });
      } catch(e) {
        res.json({ error: 'could not delete', _id });
      }
    });
};