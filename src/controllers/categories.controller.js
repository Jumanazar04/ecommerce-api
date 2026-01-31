const { z } = require("zod");
const prisma = require("../lib/prisma");

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // belgilarni tozalash
    .replace(/\s+/g, "-")          // bo‘shliq -> -
    .replace(/-+/g, "-");          // ketma-ket --- -> -
}

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(), // berilmasa name’dan generatsiya qilamiz
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
});

exports.createCategory = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const category = await prisma.category.create({
      data: { name: data.name.trim(), slug, imageUrl: imageUrl?.trim() || null },
    });

    res.status(201).json({ category });
  } catch (err) {
    // unique constraint bo‘lsa 409 qaytaramiz
    if (err.code === "P2002") {
      err.status = 409;
      err.message = "Category name or slug already exists";
    } else {
      err.status = 400;
    }
    next(err);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const items = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const idOrSlug = req.params.idOrSlug;

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = updateSchema.parse(req.body);

    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Category not found" });

    const patch = {};
    if (data.name) patch.name = data.name.trim();
    if (data.slug) patch.slug = slugify(data.slug);
    if (data.name && !data.slug) patch.slug = slugify(data.name); // name o‘zgarsa slug ham yangilansin

    const category = await prisma.category.update({
      where: { id },
      data: patch,
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    res.json({ category });
  } catch (err) {
    if (err.code === "P2002") {
      err.status = 409;
      err.message = "Category name or slug already exists";
    } else {
      err.status = 400;
    }
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;

    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Category not found" });

    await prisma.category.delete({ where: { id } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
