import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getSessionRole, hasAdminSession, loginAdmin, loginStaff, requireAdmin, requireStaff } from './auth.js';
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3100);
const chapaApiUrl = 'https://api.chapa.co/v1';
const publicApiUrl = process.env.PUBLIC_API_URL?.replace(/\/+$/, '');
const publicFrontendUrl = (process.env.PUBLIC_FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
const chapaPaymentEmail = process.env.CHAPA_PAYMENT_EMAIL ?? 'solomonyehualashet30@gmail.com';

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
const paymentRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

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
  response.json({ authenticated: hasAdminSession(request), role: getSessionRole(request) || null });
});

app.post('/api/auth/staff/login', async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!email || !password) { response.status(400).json({ message: 'Email and password are required.' }); return; }
  try {
    if (!(await loginStaff(email, password, response))) { response.status(401).json({ message: 'Invalid staff credentials.' }); return; }
    response.json({ status: 'ok' });
  } catch { response.status(500).json({ message: 'Unable to sign in.' }); }
});

app.get('/api/auth/staff/session', (request, response) => {
  const role = getSessionRole(request);
  response.json({ authenticated: Boolean(role), role: role || null });
});

app.get('/api/menu', async (request, response) => {
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

    const tableNumber = typeof request.query.table === 'string' ? request.query.table.trim() : ''
    const table = tableNumber ? await prisma.table.findFirst({ where: { hotelId: hotel.id, number: tableNumber, isActive: true } }) : null
    response.json({
      hotelName: hotel.name,
      table: table ? { id: table.id, number: table.number, label: table.label } : null,
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

type RequestedOrderItem = { id: string; quantity: number; note: string }
async function createOrder(body: any) {
  const roomOrTable = typeof body?.roomOrTable === 'string' ? body.roomOrTable.trim() : ''
  const customerName = typeof body?.customerName === 'string' ? body.customerName.trim() : null
  const customerPhone = typeof body?.customerPhone === 'string' ? body.customerPhone.trim() : null
  const customerNotes = typeof body?.customerNotes === 'string' ? body.customerNotes.trim() : null
  const tableId = typeof body?.tableId === 'string' ? body.tableId : null
  const items = Array.isArray(body?.items) ? body.items : []
  if (!roomOrTable || roomOrTable.length > 80 || items.length === 0) throw new Error('A room/table number and at least one item are required.')
  if (customerPhone && customerPhone.length > 30) throw new Error('Customer phone is invalid.')
  const requestedItems: RequestedOrderItem[] = items.map((item: unknown) => ({
    id: typeof item === 'object' && item !== null && 'id' in item ? String(item.id) : '',
    quantity: typeof item === 'object' && item !== null && 'quantity' in item ? Number(item.quantity) : 0,
    note: typeof item === 'object' && item !== null && 'note' in item && typeof item.note === 'string' ? item.note.trim() : '',
  }))
  if (requestedItems.some((item) => !item.id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100)) throw new Error('Invalid order items.')
  if (new Set(requestedItems.map((item) => item.id)).size !== requestedItems.length) throw new Error('Duplicate menu items are not allowed.')
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) throw new Error('No hotel has been configured.')
  if (tableId) {
    const table = await prisma.table.findFirst({ where: { id: tableId, hotelId: hotel.id, isActive: true } })
    if (!table) throw new Error('The selected table is not available.')
  }
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: requestedItems.map((item) => item.id) }, hotelId: hotel.id, isAvailable: true } })
  if (menuItems.length !== new Set(requestedItems.map((item) => item.id)).size) throw new Error('One or more menu items are no longer available.')
  const itemById = new Map(menuItems.map((item) => [item.id, item]))
  const orderItems = requestedItems.map((requestedItem) => {
    const menuItem = itemById.get(requestedItem.id)
    if (!menuItem) throw new Error('Menu item was not found.')
    return { menuItemId: menuItem.id, itemName: menuItem.name, unitPrice: menuItem.price, quantity: requestedItem.quantity }
  })
  const total = orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
  const reference = `SYT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const order = await prisma.order.create({ data: { hotelId: hotel.id, reference, roomOrTable, tableId, customerName: customerName || null, customerPhone: customerPhone || null, customerNotes: customerNotes || null, total, items: { create: orderItems } }, include: { items: true } })
  return { hotel, order }
}

app.post('/api/orders', async (request, response) => {
  try {
    const { order } = await createOrder(request.body)
    response.status(201).json({ reference: order.reference, status: order.status, total: order.total.toString() })
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : 'Unable to create order.' })
  }
})

app.get('/api/orders/:reference', async (request, response) => {
  const order = await prisma.order.findUnique({ where: { reference: String(request.params.reference) }, include: { items: true, table: true } })
  if (!order) { response.status(404).json({ message: 'Order not found.' }); return }
  response.json({ reference: order.reference, roomOrTable: order.roomOrTable, table: order.table ? { number: order.table.number, label: order.table.label } : null, customerName: order.customerName, customerPhone: order.customerPhone, total: order.total.toString(), status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt, items: order.items })
})

app.post('/api/payments/chapa/initialize', paymentRateLimit, async (request, response) => {
  const chapaSecretKey = process.env.CHAPA_SECRET_KEY
  if (!chapaSecretKey || !publicApiUrl) {
    response.status(503).json({ message: 'Online payments are not configured. Set CHAPA_SECRET_KEY and PUBLIC_API_URL on the backend.' })
    return
  }
  try {
    const existingReference = typeof request.body?.orderReference === 'string' ? request.body.orderReference.trim() : ''
    const hotel = await prisma.hotel.findFirst()
    if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
    const order = existingReference
      ? await prisma.order.findFirst({ where: { reference: existingReference, hotelId: hotel.id, paymentStatus: { in: ['PENDING', 'FAILED'] } }, include: { items: true } })
      : (await createOrder(request.body)).order
    if (!order) { response.status(404).json({ message: 'The order is no longer available for payment.' }); return }
    const payment = await prisma.payment.upsert({
      where: { reference: order.reference },
      create: { hotelId: hotel.id, orderId: order.id, provider: 'CHAPA', reference: order.reference, amount: order.total },
      update: { status: 'PENDING', amount: order.total },
    })
    const chapaResponse = await fetch(`${chapaApiUrl}/transaction/initialize`, { method: 'POST', headers: { Authorization: `Bearer ${chapaSecretKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(order.total).toFixed(2), currency: 'ETB', email: chapaPaymentEmail, first_name: order.customerName || 'Guest', tx_ref: order.reference, callback_url: `${publicApiUrl}/api/payments/chapa/callback`, return_url: `${publicFrontendUrl}/payment-result?tx_ref=${encodeURIComponent(order.reference)}`, customization: { title: hotel.name, description: `Order ${order.reference}` } }) })
    const chapaData = await chapaResponse.json() as { status?: string; message?: string; error?: string; data?: { checkout_url?: string; message?: string } }
    if (!chapaResponse.ok || chapaData.status !== 'success' || !chapaData.data?.checkout_url) {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } }),
        prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', rawResponse: chapaData } }),
      ])
      const providerMessage = chapaData.message || chapaData.error || chapaData.data?.message
      console.error('Chapa initialization rejected:', chapaResponse.status, chapaData)
      response.status(502).json({ message: providerMessage || `Chapa rejected the payment request (HTTP ${chapaResponse.status}).` }); return
    }
    await prisma.payment.update({ where: { id: payment.id }, data: { rawResponse: chapaData } })
    await prisma.order.update({ where: { id: order.id }, data: { paymentReference: order.reference } })
    response.status(201).json({ checkoutUrl: chapaData.data.checkout_url, reference: order.reference })
  } catch (error) { response.status(400).json({ message: error instanceof Error ? error.message : 'Unable to initialize payment.' }) }
})

type ChapaVerification = 'success' | 'failed' | 'pending'

async function verifyChapa(reference: string): Promise<ChapaVerification> {
  const key = process.env.CHAPA_SECRET_KEY
  if (!key) return 'failed'
  const result = await fetch(`${chapaApiUrl}/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${key}` } })
  const data = await result.json() as { status?: string; data?: { status?: string; tx_ref?: string; amount?: string | number; currency?: string } }
  const order = await prisma.order.findFirst({ where: { OR: [{ paymentReference: reference }, { reference }] }, select: { id: true, total: true, paymentReference: true } })
  const paid = result.ok
    && data.status === 'success'
    && data.data?.status === 'success'
    && data.data.tx_ref === reference
    && data.data.currency === 'ETB'
    && Number(data.data.amount) === Number(order?.total)
  const providerStatus = data.data?.status?.toLowerCase()
  const verification: ChapaVerification = paid
    ? 'success'
    : providerStatus === 'pending' || providerStatus === 'processing'
      ? 'pending'
      : 'failed'
  await prisma.order.updateMany({
    where: { id: order?.id, paymentReference: reference },
    data: verification === 'success'
      ? { paymentStatus: 'PAID', status: 'ACCEPTED' }
      : verification === 'failed'
        ? { paymentStatus: 'FAILED' }
        : { paymentStatus: 'PENDING' },
  })
  if (verification !== 'pending') {
    await prisma.payment.updateMany({ where: { reference }, data: { status: verification === 'success' ? 'PAID' : 'FAILED', rawResponse: data } })
  }
  return verification
}
app.post('/api/payments/chapa/webhook', async (request, response) => {
  const reference = typeof request.body?.tx_ref === 'string'
    ? request.body.tx_ref
    : typeof request.body?.reference === 'string'
      ? request.body.reference
      : ''
  if (!reference || !process.env.CHAPA_SECRET_KEY) {
    response.status(400).json({ message: 'Missing payment reference.' })
    return
  }
  try {
    const status = await verifyChapa(reference)
    response.status(status === 'failed' ? 422 : 200).json({ status })
  } catch (error) {
    console.error('Chapa webhook verification failed:', error)
    response.status(502).json({ status: 'failed' })
  }
})
app.all('/api/payments/chapa/callback', async (request, response) => {
  const reference = typeof request.query.tx_ref === 'string' ? request.query.tx_ref : typeof request.body?.tx_ref === 'string' ? request.body.tx_ref : ''
  if (!reference || !process.env.CHAPA_SECRET_KEY) { response.status(400).send('Missing payment reference.'); return }
  try {
    const status = await verifyChapa(reference)
    response.redirect(`${publicFrontendUrl}/payment-result?tx_ref=${encodeURIComponent(reference)}&status=${status}`)
  } catch {
    response.redirect(`${publicFrontendUrl}/payment-result?tx_ref=${encodeURIComponent(reference)}&status=failed`)
  }
})
app.get('/api/payments/chapa/status/:reference', async (request, response) => {
  try { response.json({ status: await verifyChapa(String(request.params.reference)) }) } catch { response.status(502).json({ status: 'failed' }) }
})
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

const orderStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED'] as const
app.get('/api/admin/orders', requireAdmin, async (_request, response) => {
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
  const orders = await prisma.order.findMany({ where: { hotelId: hotel.id }, include: { items: true, table: true }, orderBy: { createdAt: 'desc' }, take: 100 })
  response.json(orders.map((order) => ({ ...order, total: order.total.toString(), table: order.table ? { number: order.table.number, label: order.table.label } : null })))
})
app.patch('/api/admin/orders/:id/status', requireAdmin, async (request, response) => {
  const status = request.body?.status
  if (typeof status !== 'string' || !orderStatuses.includes(status as typeof orderStatuses[number])) { response.status(400).json({ message: 'Invalid order status.' }); return }
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
  try {
    const order = await prisma.order.update({ where: { id: String(request.params.id), hotelId: hotel.id }, data: { status: status as any } })
    response.json({ id: order.id, reference: order.reference, status: order.status })
  }
  catch { response.status(404).json({ message: 'Order was not found.' }) }
})
app.get('/api/admin/analytics/today', requireAdmin, async (_request, response) => {
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const orders = await prisma.order.findMany({ where: { hotelId: hotel.id, createdAt: { gte: start } }, select: { total: true, status: true } })
  const byStatus = Object.fromEntries(orderStatuses.map((status) => [status, 0]))
  let revenue = 0
  for (const order of orders) { revenue += Number(order.total); byStatus[order.status] = (byStatus[order.status] ?? 0) + 1 }
  response.json({ orders: orders.length, revenue: revenue.toFixed(2), byStatus })
})
app.get('/api/kitchen/orders', requireStaff, async (_request, response) => {
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
  const orders = await prisma.order.findMany({ where: { hotelId: hotel.id, status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] } }, include: { items: true, table: true }, orderBy: { createdAt: 'asc' }, take: 100 })
  response.json(orders.map((order) => ({ ...order, total: order.total.toString(), table: order.table ? { number: order.table.number, label: order.table.label } : null })))
})
app.patch('/api/kitchen/orders/:id/status', requireStaff, async (request, response) => {
  const status = request.body?.status
  if (typeof status !== 'string' || !orderStatuses.includes(status as typeof orderStatuses[number])) { response.status(400).json({ message: 'Invalid order status.' }); return }
  const hotel = await prisma.hotel.findFirst()
  if (!hotel) { response.status(404).json({ message: 'No hotel has been configured.' }); return }
  try {
    const order = await prisma.order.update({ where: { id: String(request.params.id), hotelId: hotel.id }, data: { status: status as any } })
    response.json({ id: order.id, status: order.status })
  }
  catch { response.status(404).json({ message: 'Order was not found.' }) }
})

const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  const listeningPort = typeof address === 'object' && address ? address.port : port;
  console.log(`Backend API listening on http://0.0.0.0:${listeningPort}`);
});

server.on('error', (error) => {
  console.error('Backend API failed to start:', error);
  process.exitCode = 1;
});
