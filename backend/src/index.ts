import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { hasAdminSession, loginAdmin, requireAdmin } from './auth.js';
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/auth/admin/login', async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!email || !password) {
    response.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    if (!(await loginAdmin(email, password, response))) {
      response.status(401).json({ message: 'Invalid administrator credentials.' });
      return;
    }
    response.json({ status: 'ok' });
  } catch (error) {
    console.error('Admin login failed:', error);
    response.status(500).json({ message: 'Unable to sign in.' });
  }
});

app.post('/api/auth/admin/logout', (_request, response) => {
  response.clearCookie('hotel_session');
  response.json({ status: 'ok' });
});

app.get('/api/auth/admin/session', (request, response) => {
  response.json({ authenticated: hasAdminSession(request) });
});

app.get('/api/menu', async (_request, response) => {
  try {
    const hotel = await prisma.hotel.findFirst({
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            menuItems: {
              where: { isAvailable: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!hotel) {
      response.status(404).json({ message: 'No hotel menu has been configured.' });
      return;
    }

    response.json({
      hotelName: hotel.name,
      categories: hotel.categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAm: category.nameAm,
        nameOr: category.nameOr,
        items: category.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          nameAm: item.nameAm,
          nameOr: item.nameOr,
          description: item.description,
          descriptionAm: item.descriptionAm,
          descriptionOr: item.descriptionOr,
          price: item.price.toString(),
          image: item.imageUrl,
        })),
      })),
    });
  } catch (error) {
    console.error('Failed to load menu:', error);
    response.status(500).json({ message: 'Unable to load the menu.' });
  }
});

app.get('/api/admin/menu', requireAdmin, async (_request, response) => {
  try {
    const hotel = await prisma.hotel.findFirst({
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: { menuItems: { orderBy: { displayOrder: 'asc' } } },
        },
      },
    });

    if (!hotel) {
      response.status(404).json({ message: 'No hotel has been configured.' });
      return;
    }

    response.json({
      hotelId: hotel.id,
      categories: hotel.categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAm: category.nameAm,
        nameOr: category.nameOr,
        items: category.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          nameAm: item.nameAm,
          nameOr: item.nameOr,
          description: item.description,
          descriptionAm: item.descriptionAm,
          descriptionOr: item.descriptionOr,
          imageUrl: item.imageUrl,
          categoryId: item.categoryId,
          price: item.price.toString(),
          available: item.isAvailable,
        })),
      })),
    });
  } catch (error) {
    console.error('Failed to load admin menu:', error);
    response.status(500).json({ message: 'Unable to load the admin menu.' });
  }
});

app.post('/api/admin/categories', requireAdmin, async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  if (!name) {
    response.status(400).json({ message: 'Category name is required.' });
    return;
  }

  try {
    const hotel = await prisma.hotel.findFirst({
      include: { categories: { select: { displayOrder: true } } },
    });
    if (!hotel) {
      response.status(404).json({ message: 'No hotel has been configured.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        hotelId: hotel.id,
        name,
        displayOrder: hotel.categories.length,
      },
    });
    response.status(201).json(category);
  } catch (error) {
    console.error('Failed to create category:', error);
    response.status(500).json({ message: 'Unable to create the category.' });
  }
});

app.patch('/api/admin/categories/:id', requireAdmin, async (request, response) => {
  const { name, nameAm, nameOr } = request.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    response.status(400).json({ message: 'Category name is required.' });
    return;
  }

  try {
    const category = await prisma.category.update({
      where: { id: String(request.params.id) },
      data: {
        name: name.trim(),
        nameAm: typeof nameAm === 'string' ? nameAm.trim() || null : null,
        nameOr: typeof nameOr === 'string' ? nameOr.trim() || null : null,
      },
    });
    response.json(category);
  } catch (error) {
    console.error('Failed to update category:', error);
    response.status(404).json({ message: 'Category was not found.' });
  }
});

app.post('/api/admin/menu-items', requireAdmin, async (request, response) => {
  const { categoryId, description, descriptionAm, descriptionOr, imageUrl, name, nameAm, nameOr, price } = request.body ?? {};
  const numericPrice = Number(price);
  if (
    typeof categoryId !== 'string' ||
    typeof name !== 'string' ||
    !name.trim() ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0
  ) {
    response.status(400).json({ message: 'A category, name, and positive price are required.' });
    return;
  }

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      response.status(400).json({ message: 'The selected category does not exist.' });
      return;
    }

    const item = await prisma.menuItem.create({
      data: {
        hotelId: category.hotelId,
        categoryId,
        name: name.trim(),
        nameAm: typeof nameAm === 'string' ? nameAm.trim() || null : null,
        nameOr: typeof nameOr === 'string' ? nameOr.trim() || null : null,
        description: typeof description === 'string' ? description.trim() || null : null,
        descriptionAm: typeof descriptionAm === 'string' ? descriptionAm.trim() || null : null,
        descriptionOr: typeof descriptionOr === 'string' ? descriptionOr.trim() || null : null,
        imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() || null : null,
        price: numericPrice,
      },
    });
    response.status(201).json(item);
  } catch (error) {
    console.error('Failed to create menu item:', error);
    response.status(500).json({ message: 'Unable to create the menu item.' });
  }
});

app.patch('/api/admin/menu-items/:id', requireAdmin, async (request, response) => {
  const { categoryId, description, descriptionAm, descriptionOr, imageUrl, isAvailable, name, nameAm, nameOr, price } = request.body ?? {};
  const numericPrice = Number(price);
  if (
    typeof categoryId !== 'string' ||
    typeof name !== 'string' ||
    !name.trim() ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0
  ) {
    response.status(400).json({ message: 'A category, name, and positive price are required.' });
    return;
  }

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      response.status(400).json({ message: 'The selected category does not exist.' });
      return;
    }
    const item = await prisma.menuItem.update({
      where: { id: String(request.params.id) },
      data: {
        categoryId,
        name: name.trim(),
        nameAm: typeof nameAm === 'string' ? nameAm.trim() || null : null,
        nameOr: typeof nameOr === 'string' ? nameOr.trim() || null : null,
        description: typeof description === 'string' ? description.trim() || null : null,
        descriptionAm: typeof descriptionAm === 'string' ? descriptionAm.trim() || null : null,
        descriptionOr: typeof descriptionOr === 'string' ? descriptionOr.trim() || null : null,
        imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() || null : null,
        price: numericPrice,
        ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
      },
    });
    response.json(item);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    response.status(404).json({ message: 'Menu item was not found.' });
  }
});

app.patch('/api/admin/menu-items/:id/availability', requireAdmin, async (request, response) => {
  const isAvailable = request.body?.isAvailable;
  if (typeof isAvailable !== 'boolean') {
    response.status(400).json({ message: 'isAvailable must be a boolean.' });
    return;
  }

  try {
    const item = await prisma.menuItem.update({
      where: { id: String(request.params.id) },
      data: { isAvailable },
    });
    response.json(item);
  } catch (error) {
    console.error('Failed to update menu item availability:', error);
    response.status(404).json({ message: 'Menu item was not found.' });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  const listeningPort = typeof address === 'object' && address ? address.port : port;
  console.log(`Backend API listening on http://0.0.0.0:${listeningPort}`);
});

server.on('error', (error) => {
  console.error('Backend API failed to start:', error);
  process.exitCode = 1;
});
