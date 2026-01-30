const router = require("express").Router();
const authRoutes = require("./auth.routes");
const productsRoutes = require("./products.routes");
const categoriesRoutes = require("./categories.routes");
const cartRoutes = require("./cart.routes");


router.get("/", (req, res) => res.json({ message: "Ecommerce API v1" }));

// TEST (xohlasang keyin olib tashlaysan)
router.get("/auth-test", (req, res) => res.json({ ok: true }));
// ✅ PRODUCTS ROUTES
router.use("/products", productsRoutes);
// ✅ AUTH ROUTES
router.use("/auth", authRoutes);
// ✅ CATEGORIES ROUTES
router.use("/categories", categoriesRoutes);
// ✅ CART ROUTES
router.use("/cart", cartRoutes);
// ✅ ORDERS ROUTES
router.use("/orders", require("./orders.routes"));


module.exports = router;
