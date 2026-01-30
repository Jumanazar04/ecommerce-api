const prisma = require("../lib/prisma");

exports.checkout = async (req, res, next) => {
  try {
    const userId = req.userId;

    const result = await prisma.$transaction(async (tx) => {
      // 1) cart items + productlar
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        return { error: "Cart is empty" };
      }

      // 2) stock tekshir
      for (const it of cartItems) {
        if (it.quantity > it.product.stock) {
          return { error: `Not enough stock for: ${it.product.title}. Available: ${it.product.stock}` };
        }
      }

      // 3) subtotal
      const subtotal = cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

      // 4) Order yarat
      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          items: {
            create: cartItems.map((it) => ({
              productId: it.productId,
              title: it.product.title,
              price: it.product.price,
              quantity: it.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // 5) stock kamaytir
      for (const it of cartItems) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      // 6) cartni tozalash
      await tx.cartItem.deleteMany({ where: { userId } });

      return { order };
    });

    if (result.error) return res.status(400).json({ error: result.error });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.listMyOrders = async (req, res, next) => {
  try {
    const userId = req.userId;

    const items = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ order });
  } catch (err) {
    next(err);
  }
};
