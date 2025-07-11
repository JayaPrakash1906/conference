const Team = require('../model/teamModel');

exports.getTeamsByCategory = async (req, res) => {
  const result = await Team.getByCategory(req.params.categoryId);
  res.json(result.rows);
};

exports.createTeam = async (req, res) => {
  const { name, categoryId } = req.body;
  const result = await Team.create(name, categoryId);
  res.status(201).json(result.rows[0]);
};

exports.updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await Team.update(id, name);
  res.json(result.rows[0]);
};

exports.deleteTeam = async (req, res) => {
  const { id } = req.params;
  await Team.delete(id);
  res.sendStatus(204);
};
