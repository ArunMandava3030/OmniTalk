/**
 * E-commerce Integration Service
 * Connectors for Shopify, WooCommerce, Magento, and other platforms
 */

import axios from 'axios';

export interface StoreConfig {
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  apiKey: string;
  apiUrl?: string;
  storeUrl?: string;
  accessToken?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  sku?: string;
  inventory: number;
  imageUrl?: string;
  options?: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: string;
}

export class EcommerceService {
  private clients: Map<string, any> = new Map();

  /**
   * Add a new e-commerce store connector
   */
  addStore(botId: string, config: StoreConfig) {
    const key = `${botId}:${config.platform}`;
    this.clients.set(key, this.createClient(config));
  }

  /**
   * Remove store connector
   */
  removeStore(botId: string, platform: string) {
    const key = `${botId}:${platform}`;
    this.clients.delete(key);
  }

  /**
   * Get products from store
   */
  async getProducts(botId: string, platform: string): Promise<Product[]> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No connector found for bot ${botId} on platform ${platform}`);
    }

    return client.getProducts();
  }

  /**
   * Get product by ID
   */
  async getProduct(botId: string, platform: string, productId: string): Promise<Product | null> {
    const products = await this.getProducts(botId, platform);
    return products.find(p => p.id === productId) || null;
  }

  /**
   * Create an order
   */
  async createOrder(
    botId: string,
    platform: string,
    order: Omit<Order, 'id' | 'status' | 'createdAt'>
  ): Promise<Order> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No connector found for bot ${botId} on platform ${platform}`);
    }

    return client.createOrder(order);
  }

  /**
   * Get order status
   */
  async getOrderStatus(botId: string, platform: string, orderId: string): Promise<Order | null> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No connector found for bot ${botId} on platform ${platform}`);
    }

    return client.getOrder(orderId);
  }

  /**
   * Create platform-specific client
   */
  private createClient(config: StoreConfig) {
    switch (config.platform) {
      case 'shopify':
        return new ShopifyClient(config);
      case 'woocommerce':
        return new WooCommerceClient(config);
      case 'magento':
        return new MagentoClient(config);
      default:
        throw new Error(`Unsupported platform: ${config.platform}`);
    }
  }
}

/**
 * Shopify API Client
 */
class ShopifyClient {
  private shopify: any;

  constructor(private config: StoreConfig) {
    // Shopify API client initialization
    this.shopify = axios.create({
      baseURL: config.apiUrl || `https://${config.storeUrl}/admin/api/2024-01`,
      headers: {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProducts(): Promise<Product[]> {
    const response = await this.shopify.get('/products.json');
    return response.data.products.map((p: any) => ({
      id: p.id.toString(),
      title: p.title,
      description: p.body_html,
      price: parseFloat(p.variants[0]?.price || '0'),
      currency: 'USD',
      sku: p.variants[0]?.sku,
      inventory: p.variants[0]?.inventory_quantity || 0,
      imageUrl: p.image?.src,
    }));
  }

  async createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const response = await this.shopify.post('/orders.json', {
      order: {
        line_items: order.items.map(item => ({
          variant_id: item.productId,
          quantity: item.quantity,
        })),
        shipping_address: {
          name: order.shippingAddress.name,
          address1: order.shippingAddress.address,
          city: order.shippingAddress.city,
          zip: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone,
        },
        financial_status: 'pending',
        fulfillment_status: 'unfulfilled',
      },
    });

    return {
      id: response.data.order.id.toString(),
      orderNumber: response.data.order.name,
      customerId: response.data.order.customer?.id?.toString(),
      items: order.items,
      total: order.total,
      status: 'pending' as const,
      trackingNumber: response.data.order.fulfillments?.[0]?.tracking_number,
      shippingAddress: order.shippingAddress,
      createdAt: response.data.order.created_at,
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await this.shopify.get(`/${orderId}.json`);
      const o = response.data.order;
      return {
        id: o.id.toString(),
        orderNumber: o.name,
        customerId: o.customer?.id?.toString(),
        items: o.line_items.map((item: any) => ({
          productId: item.variant_id.toString(),
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        total: parseFloat(o.total_price),
        status: o.fulfillment_status === 'fulfilled' ? 'delivered' : 'pending',
        trackingNumber: o.fulfillments?.[0]?.tracking_number,
        shippingAddress: {
          name: o.shipping_address?.name || '',
          address: o.shipping_address?.address1 || '',
          city: o.shipping_address?.city || '',
          postalCode: o.shipping_address?.zip || '',
          country: o.shipping_address?.country || '',
          phone: o.shipping_address?.phone,
        },
        createdAt: o.created_at,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * WooCommerce API Client
 */
class WooCommerceClient {
  private client: any;

  constructor(private config: StoreConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl || `${config.storeUrl}/wp-json/wc/v3`,
      auth: {
        username: config.apiKey,
        password: config.accessToken || '',
      },
    });
  }

  async getProducts(): Promise<Product[]> {
    const response = await this.client.get('/products');
    return response.data.map((p: any) => ({
      id: p.id.toString(),
      title: p.name,
      description: p.description,
      price: parseFloat(p.price),
      currency: p.currency || 'USD',
      sku: p.sku,
      inventory: p.stock_quantity || 0,
      imageUrl: p.images?.[0]?.src,
    }));
  }

  async createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const response = await this.client.post('/orders', {
      payment_method: 'bacs',
      payment_method_title': 'Bank Transfer',
      set_paid: false,
      billing: {
        first_name: order.shippingAddress.name.split(' ')[0],
        last_name: order.shippingAddress.name.split(' ')[1] || '',
        address_1: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postcode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone,
      },
      shipping: {
        method: 'flat_rate',
      },
      line_items: order.items.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
      })),
      total: order.total.toString(),
    });

    return {
      id: response.data.id.toString(),
      orderNumber: response.data.order_number || response.data.id.toString(),
      customerId: response.data.customer_id?.toString(),
      items: order.items,
      total: parseFloat(response.data.total),
      status: 'pending' as const,
      shippingAddress: order.shippingAddress,
      createdAt: response.data.date_created,
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await this.client.get(`/${orderId}`);
      const o = response.data;
      return {
        id: o.id.toString(),
        orderNumber: o.order_number || o.id.toString(),
        customerId: o.customer_id?.toString(),
        items: o.line_items.map((item: any) => ({
          productId: item.product_id.toString(),
          quantity: item.quantity,
          price: parseFloat(item.total),
        })),
        total: parseFloat(o.total),
        status: o.status as any,
        trackingNumber: o.tracking_numbers?.[0]?.number,
        shippingAddress: {
          name: `${o.billing.first_name} ${o.billing.last_name}`,
          address: o.billing.address_1,
          city: o.billing.city,
          postalCode: o.billing.postcode,
          country: o.billing.country,
          phone: o.billing.phone,
        },
        createdAt: o.date_created,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Magento API Client
 */
class MagentoClient {
  private client: any;

  constructor(private config: StoreConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl || `${config.storeUrl}/rest/V1`,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProducts(): Promise<Product[]> {
    const response = await this.client.get('/products');
    return response.data.items.map((p: any) => ({
      id: p.entity_id.toString(),
      title: p.name,
      description: p.description,
      price: p.price,
      currency: 'USD',
      sku: p.sku,
      inventory: p.stock_status === 1 ? p.qty : 0,
      imageUrl: p.media_gallery_entries?.[0]?.file,
    }));
  }

  async createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const response = await this.client.post('/orders', {
      entity: {
        customer_id: 0,
        customer_email: order.shippingAddress.name,
        items: order.items,
        total_amount: order.total,
        billing_address: {
          firstname: order.shippingAddress.name.split(' ')[0],
          lastname: order.shippingAddress.name.split(' ')[1] || '',
          street: [order.shippingAddress.address],
          city: order.shippingAddress.city,
          region: '',
          postcode: order.shippingAddress.postalCode,
          country_id: order.shippingAddress.country,
          telephone: order.shippingAddress.phone,
        },
      },
    });

    return {
      id: response.data.entity_id?.toString() || '0',
      orderNumber: response.data.increment_id,
      items: order.items,
      total: order.total,
      status: 'pending' as const,
      shippingAddress: order.shippingAddress,
      createdAt: new Date().toISOString(),
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await this.client.get(`/${orderId}`);
      const o = response.data;
      return {
        id: o.entity_id.toString(),
        orderNumber: o.increment_id,
        items: o.items.map((item: any) => ({
          productId: item.product_id.toString(),
          quantity: item.qty_ordered,
          price: parseFloat(item.price),
        })),
        total: parseFloat(o.base_grand_total),
        status: o.status.toLowerCase() as any,
        trackingNumber: o.track_number || '',
        shippingAddress: {
          name: o.shipping_address?.firstname + ' ' + o.shipping_address?.lastname,
          address: o.shipping_address?.street?.join(','),
          city: o.shipping_address?.city,
          postalCode: o.shipping_address?.postcode,
          country: o.shipping_address?.country_id,
          phone: o.shipping_address?.telephone,
        },
        createdAt: o.created_at,
      };
    } catch (error) {
      return null;
    }
  }
}

export const ecommerceService = new EcommerceService();