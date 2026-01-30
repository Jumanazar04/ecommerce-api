exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) return res.status(401).json({ error: "Unauthorized" });

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
