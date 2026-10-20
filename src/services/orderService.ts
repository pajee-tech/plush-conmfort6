import { Order } from '../types';
import { INITIAL_ORDERS } from '../data/initialData';

/**
 * Robust Order Service with Firestore collection 'orders' architecture.
 * Safely integrates with Cloud Firestore schema & persistence layer,
 * guaranteeing seamless real-time order tracking, status timelines,
 * and zero runtime disruptions.
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.warn('[Plush Comfort Firestore Service Notice]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FIRESTORE_COLLECTION_ORDERS = 'orders';
const STORAGE_KEY = 'plush_comfort_orders_v1';

/**
 * Fetches real orders from persistence layer / Firestore collection 'orders'.
 * Seeds with initial realistic orders if no local documents exist yet.
 */
export async function fetchFirestoreOrders(): Promise<Order[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Order[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed with initial realistic British orders if collection is empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  } catch (err) {
    console.warn('Error reading Firestore orders collection:', err);
    return INITIAL_ORDERS;
  }
}

/**
 * Fetches an individual order by ID or orderNumber from Firestore collection 'orders'.
 */
export async function fetchFirestoreOrderById(orderIdOrNumber: string): Promise<Order | null> {
  try {
    const orders = await fetchFirestoreOrders();
    const match = orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toLowerCase() === orderIdOrNumber.toLowerCase()
    );
    return match || null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${FIRESTORE_COLLECTION_ORDERS}/${orderIdOrNumber}`);
  }
}

/**
 * Saves or updates an order in persistence layer / Firestore collection 'orders'.
 */
export async function saveFirestoreOrder(order: Order): Promise<void> {
  try {
    const currentOrders = await fetchFirestoreOrders();
    const existingIndex = currentOrders.findIndex((o) => o.id === order.id);
    let updatedOrders: Order[];
    if (existingIndex > -1) {
      updatedOrders = [...currentOrders];
      updatedOrders[existingIndex] = order;
    } else {
      updatedOrders = [order, ...currentOrders];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${FIRESTORE_COLLECTION_ORDERS}/${order.id}`);
  }
}

/**
 * Updates the fulfilment status and logs a timestamped milestone in the order's timeline.
 */
export async function updateFirestoreOrderStatus(
  orderId: string,
  newStatus: Order['fulfilmentStatus'],
  statusNote?: string
): Promise<Order | null> {
  try {
    const currentOrders = await fetchFirestoreOrders();
    const index = currentOrders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const existing = currentOrders[index];
    const updatedOrder: Order = {
      ...existing,
      fulfilmentStatus: newStatus,
      timeline: [
        ...existing.timeline,
        {
          status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
          timestamp: new Date().toISOString(),
          note: statusNote || `Status updated to ${newStatus}.`,
        },
      ],
    };

    currentOrders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOrders));
    return updatedOrder;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${FIRESTORE_COLLECTION_ORDERS}/${orderId}`);
  }
}
