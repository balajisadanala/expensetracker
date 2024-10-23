const express = require('express');
const router = express.Router();
const db = require('../database');

// Add a new transaction
router.post('/transactions', (req, res) => {
  const { type, category, amount, date, description } = req.body;
  const query = `
    INSERT INTO transactions (type, category, amount, date, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [type, category, amount, date, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// Retrieve all transactions
router.get('/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Retrieve a transaction by ID
router.get('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    res.json(row);
  });
});

// Update a transaction by ID
router.put('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { type, category, amount, date, description } = req.body;
  const query = `
    UPDATE transactions
    SET type = ?, category = ?, amount = ?, date = ?, description = ?
    WHERE id = ?
  `;

  db.run(query, [type, category, amount, date, description, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction updated successfully' });
  });
});

// Delete a transaction by ID
router.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  });
});

// Retrieve summary of transactions
router.get('/summary', (req, res) => {
  const { startDate, endDate, category } = req.query;
  let query = `SELECT type, SUM(amount) AS total FROM transactions`;
  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('date <= ?');
    params.push(endDate);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' GROUP BY type';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const summary = { income: 0, expense: 0 };
    rows.forEach((row) => {
      summary[row.type] = row.total;
    });
    summary.balance = summary.income - summary.expense;
    res.json(summary);
  });
});

module.exports = router;
