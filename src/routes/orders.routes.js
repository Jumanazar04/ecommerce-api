const router = require("express").Router();
const { requireAuth } = require("../middleware/requireAuth");
const { checkout, listMyOrders, getMyOrder } = require("../controllers/orders.controller");

router.use(requireAuth);

router.post("/checkout", checkout);
router.get("/", listMyOrders);
router.get("/:id", getMyOrder);

module.exports = router;
