// Role-based access control helpers

export const ROLES = {
  admin:  { code: 'ADMIN2025',  label: 'Administrator', route: '/admin',  icon: '👨‍💼', color: '#c9a84c' },
  kassir: { code: 'KASSIR2025', label: 'Kassir',        route: '/kassir', icon: '💰', color: '#3b82f6' },
  oshpaz: { code: 'OSHPAZ2025', label: 'Oshpaz',        route: '/oshpaz', icon: '👨‍🍳', color: '#10b981' },
  boss:   { code: 'BOSS2025',   label: 'Boss',           route: '/boss',   icon: '👑', color: '#a855f7' },
};

export function checkRole(code) {
  return Object.values(ROLES).find(r => r.code === code.trim()) || null;
}

export function setStaffSession(role) {
  sessionStorage.setItem('bv_staff_role', role);
}

export function getStaffSession() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('bv_staff_role');
}

export function clearStaffSession() {
  sessionStorage.removeItem('bv_staff_role');
}
