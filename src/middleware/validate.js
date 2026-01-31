// src/middlewares/validate.js
module.exports = (schema) => (req, res, next) => {
  try {
    req.validated = schema.parse(req.body);
    next();
  } catch (e) {
    e.status = 400;
    next(e);
  }
};
