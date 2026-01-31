// src/middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    error: {
      message: err.message || "Server error",
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    },
  });
};
