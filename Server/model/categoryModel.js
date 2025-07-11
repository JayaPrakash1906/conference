const db = require('../config/db');

exports.getAll = () => db.query('SELECT * FROM categories ORDER BY id');

exports.create = (name) =>
  db.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);

exports.update = (id, name) =>
  db.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);

exports.delete = (id) =>
  db.query('DELETE FROM categories WHERE id = $1', [id]);
