const router = require("express").Router();
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");

const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

// Public
router.get("/", listProducts);
router.get("/:id", getProduct);

// Admin protected
router.post("/", requireAuth, requireRole("ADMIN"), createProduct);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateProduct);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteProduct);

module.exports = router;
