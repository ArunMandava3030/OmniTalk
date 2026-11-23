/**
 * E-commerce Routes
 * Product and order management integrations
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ecommerceService } from '../services/ecommerceService';

const router = Router();

// Validation schemas
const addStoreSchema = z.object({
  platform: z.enum(['shopify', 'woocommerce', 'magento']),
  apiKey: z.string(),
  apiUrl: z.string().url().optional(),
  storeUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
});

const createOrderSchema = z.object({
  botId: z.string().uuid(),
  platform: z.enum(['shopify', 'woocommerce', 'magento']),
  order: z.object({
    orderNumber: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    total: z.number(),
    shippingAddress: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      postalCode: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    }),
  }),
});

/**
 * Add e-commerce store connector
 * POST /api/ecommerce/stores
 */
router.post('/stores', async (req: Request, res: Response) => {
  try {
    const data = addStoreSchema.parse(req.body);
    const botId = (req as any).user.botId || req.body.botId;

    if (!botId) {
      return res.status(400).json({ error: 'Bot ID required' });
    }

    ecommerceService.addStore(botId, data);
    res.status(201).json({ message: 'Store connector added successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add store' });
  }
});

/**
 * Get products from store
 * GET /api/ecommerce/products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const botId = (req as any).user.botId;
    const platform = req.query.platform as string;

    if (!platform) {
      return res.status(400).json({ error: 'Platform parameter required' });
    }

    const products = await ecommerceService.getProducts(botId, platform);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * Create order
 * POST /api/ecommerce/orders
 */
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const data = createOrderSchema.parse(req.body);

    const order = await ecommerceService.createOrder(
      data.botId,
      data.platform,
      data.order
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

/**
 * Get order status
 * GET /api/ecommerce/orders/:id
 */
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const botId = (req as any).user.botId;
    const platform = req.query.platform as string;

    if (!platform) {
      return res.status(400).json({ error: 'Platform parameter required' });
    }

    const order = await ecommerceService.getOrderStatus(botId, platform, id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export { router as ecommerceRouter };