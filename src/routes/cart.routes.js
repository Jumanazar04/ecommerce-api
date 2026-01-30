const router = require("express").Router();
const { requireAuth } = require("../middleware/requireAuth");
const {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controller");

router.use(requireAuth);

router.get("/", getMyCart);
router.post("/items", addToCart);
router.patch("/items/:id", updateCartItem);
router.delete("/items/:id", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
