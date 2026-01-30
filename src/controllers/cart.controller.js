const { z } = require("zod");
const prisma = require("../lib/prisma");

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999).optional(), // default 1
});

const updateSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

exports.getMyCart = async (req, res, next) => {
  try {
    const userId = req.userId;

    const items = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, title: true, price: true, stock: true },
        },
      },
    });

    const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

    res.json({ items, subtotal });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const data = addSchema.parse(req.body);
    const qty = data.quantity ?? 1;

    // Product mavjudligini va stockni tekshiramiz
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, stock: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // cartItem mavjud bo‘lsa quantity qo‘shamiz, bo‘lmasa yaratamiz (transaction)
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId, productId: data.productId } },
      });

      const nextQty = (existing?.quantity ?? 0) + qty;

      if (nextQty > product.stock) {
        return { error: `Not enough stock. Available: ${product.stock}` };
      }

      if (existing) {
        const updated = await tx.cartItem.update({
          where: { userId_productId: { userId, productId: data.productId } },
          data: { quantity: nextQty },
          include: { product: { select: { id: true, title: true, price: true, stock: true } } },
        });
        return { item: updated };
      } else {
        const created = await tx.cartItem.create({
          data: { userId, productId: data.productId, quantity: qty },
          include: { product: { select: { id: true, title: true, price: true, stock: true } } },
        });
        return { item: created };
      }
    });

    if (result.error) return res.status(400).json({ error: result.error });

    res.status(201).json(result);
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const data = updateSchema.parse(req.body);

    const item = await prisma.cartItem.findFirst({
      where: { id, userId },
      include: { product: { select: { stock: true, id: true, title: true, price: true } } },
    });
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    if (data.quantity > item.product.stock) {
      return res.status(400).json({ error: `Not enough stock. Available: ${item.product.stock}` });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: data.quantity },
      include: { product: { select: { id: true, title: true, price: true, stock: true } } },
    });

    res.json({ item: updated });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const item = await prisma.cartItem.findFirst({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    await prisma.cartItem.delete({ where: { id } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.userId;

    await prisma.cartItem.deleteMany({ where: { userId } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
