module.exports = function (req, res, next) {
  // Example: req.user should be set by previous auth middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}; 