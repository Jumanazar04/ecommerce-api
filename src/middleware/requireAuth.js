const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
