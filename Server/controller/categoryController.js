const Category = require('../model/categoryModel');

exports.getAllCategories = async (req, res) => {
  const result = await Category.getAll();
  res.json(result.rows);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const result = await Category.create(name);
  res.status(201).json(result.rows[0]);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await Category.update(id, name);
  res.json(result.rows[0]);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.delete(id);
  res.sendStatus(204);
};
