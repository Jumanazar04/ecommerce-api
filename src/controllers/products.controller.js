const { z } = require("zod");
const prisma = require("../lib/prisma");

// price: tiyin/sent (int). Masalan 199900 = 1999.00
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),

});

const updateSchema = createSchema.partial();

exports.createProduct = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
        categoryId: data.categoryId ?? null,

      },
    });

    res.status(201).json({ product });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const q = (req.query.q || "").toString().trim();

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { id: true, name: true, slug: true } } },

      }),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = updateSchema.parse(req.body);

    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Product not found" });

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({ product });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { id } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
