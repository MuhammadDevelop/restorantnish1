// Menu items stored in localStorage so admin changes reflect on site instantly

const DEFAULT_MENU = [
  { id: 1, name: 'Truffle Carbonara',    category: 'Asosiy taom', price: 38, desc: 'Hand-pulled spaghetti with aged pecorino, guanciale, and fresh black truffle shavings.', img: '/dish1.png', tag: "Chef's Pick",  time: '25 daq', available: true },
  { id: 2, name: 'Glazed Salmon',        category: 'Asosiy taom', price: 44, desc: 'Pan-seared Atlantic salmon, lemon butter sauce, asparagus, and heirloom tomatoes.',      img: '/dish2.png', tag: 'Popular',    time: '20 daq', available: true },
  { id: 3, name: 'Lava Chocolate Cake',  category: 'Shirinlik',   price: 18, desc: 'Warm dark chocolate fondant with vanilla bean ice cream and fresh raspberry coulis.',     img: '/dish3.png', tag: 'Signature', time: '15 daq', available: true },
  { id: 4, name: 'Burrata & Prosciutto', category: 'Starter',     price: 22, desc: 'Creamy buffalo burrata, aged prosciutto di Parma, cherry tomatoes, and basil oil.',       img: '/dish1.png', tag: null,        time: '10 daq', available: true },
  { id: 5, name: 'Lobster Bisque',       category: 'Starter',     price: 28, desc: 'Rich, velvety lobster bisque with brandy cream, fresh dill, and sourdough croutons.',    img: '/dish2.png', tag: 'New',       time: '15 daq', available: true },
  { id: 6, name: 'Crème Brûlée',         category: 'Shirinlik',   price: 16, desc: 'Classic Parisian vanilla custard with a perfectly caramelized sugar crust.',             img: '/dish3.png', tag: null,        time: '12 daq', available: true },
];

export const CATEGORIES = ['Asosiy taom', 'Starter', 'Shirinlik', 'Ichimlik', 'Salatlar'];
export const TAGS       = ['', "Chef's Pick", 'Popular', 'Signature', 'New', 'Special'];
export const IMAGES     = ['/dish1.png', '/dish2.png', '/dish3.png'];

export function getMenu() {
  if (typeof window === 'undefined') return DEFAULT_MENU;
  try {
    const saved = localStorage.getItem('bv_menu');
    if (!saved) {
      localStorage.setItem('bv_menu', JSON.stringify(DEFAULT_MENU));
      return DEFAULT_MENU;
    }
    return JSON.parse(saved);
  } catch { return DEFAULT_MENU; }
}

export function saveMenu(items) {
  localStorage.setItem('bv_menu', JSON.stringify(items));
  window.dispatchEvent(new Event('bv_menu_updated'));
}

export function addMenuItem(item) {
  const menu = getMenu();
  const newItem = { ...item, id: Date.now(), available: true };
  const updated = [...menu, newItem];
  saveMenu(updated);
  return updated;
}

export function updateMenuItem(id, data) {
  const updated = getMenu().map(m => m.id === id ? { ...m, ...data } : m);
  saveMenu(updated);
  return updated;
}

export function deleteMenuItem(id) {
  const updated = getMenu().filter(m => m.id !== id);
  saveMenu(updated);
  return updated;
}

export function toggleAvailable(id) {
  const updated = getMenu().map(m => m.id === id ? { ...m, available: !m.available } : m);
  saveMenu(updated);
  return updated;
}
