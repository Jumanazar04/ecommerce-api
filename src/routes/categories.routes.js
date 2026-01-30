const router = require("express").Router();
const {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories.controller");

const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

// Public
router.get("/", listCategories);
router.get("/:idOrSlug", getCategory);

// Admin
router.post("/", requireAuth, requireRole("ADMIN"), createCategory);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateCategory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteCategory);

module.exports = router;
