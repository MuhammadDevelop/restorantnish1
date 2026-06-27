// Shared order store using localStorage
// All orders flow: Delivery page → localStorage → Admin panel

export function getOrders() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('bv_orders') || '[]'); }
  catch { return []; }
}

export function addOrder(orderData) {
  const orders = getOrders();
  const order = {
    ...orderData,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  orders.unshift(order);
  localStorage.setItem('bv_orders', JSON.stringify(orders));
  // Notify admin panel (storage event)
  window.dispatchEvent(new Event('bv_new_order'));
  return order;
}

export function updateOrderStatus(id, status) {
  const orders = getOrders();
  const updated = orders.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o);
  localStorage.setItem('bv_orders', JSON.stringify(updated));
  return updated;
}

export function deleteOrder(id) {
  const orders = getOrders().filter(o => o.id !== id);
  localStorage.setItem('bv_orders', JSON.stringify(orders));
  return orders;
}

export function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Bugun';
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

export const STATUS_CONFIG = {
  new:       { label: 'Yangi',          color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  next: 'cooking',   nextLabel: '👨‍🍳 Tayyorlashni boshlash' },
  cooking:   { label: 'Tayyorlanmoqda', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  next: 'ready',     nextLabel: '📦 Tayyor deb belgilash' },
  ready:     { label: 'Tayyor',         color: '#34d399', bg: 'rgba(52,211,153,0.12)',   next: 'delivered', nextLabel: '✅ Yetkazildi' },
  delivered: { label: 'Yetkazildi',     color: '#6b7280', bg: 'rgba(107,114,128,0.1)',   next: null,        nextLabel: null },
  cancelled: { label: 'Bekor qilindi',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',   next: null,        nextLabel: null },
  table:     { label: 'Stol bron',      color: '#c9a84c', bg: 'rgba(201,168,76,0.12)',   next: 'delivered', nextLabel: '✅ Tashrif buyurdi' },
};
