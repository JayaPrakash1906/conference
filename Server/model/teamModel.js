const db = require('../config/db');

exports.getByCategory = (categoryId) =>
  db.query('SELECT * FROM teams WHERE category_id = $1 ORDER BY id', [categoryId]);

exports.create = (name, categoryId) =>
  db.query('INSERT INTO teams (name, category_id) VALUES ($1, $2) RETURNING *', [name, categoryId]);

exports.update = (id, name) =>
  db.query('UPDATE teams SET name = $1 WHERE id = $2 RETURNING *', [name, id]);

exports.delete = (id) =>
  db.query('DELETE FROM teams WHERE id = $1', [id]);
