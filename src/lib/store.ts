import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { api, setToken, getToken } from "./api";

export type Role = "admin" | "customer";
export type UserStatus = "active" | "suspended" | "banned";
export type OrderStatus = "Pending" | "In Progress" | "Ready For Delivery" | "Delivered" | "Refunded";

export interface User {
  id: number | string; name: string; email: string;
  role: Role; status: UserStatus;
  billing?: { country?: string; address?: string; city?: string; zip?: string };
  createdAt: number | string;
}
export interface Variation { id: string; name: string; price: number }
export interface Product {
  id: number | string; slug: string; title: string; description: string;
  price: number; salePrice?: number;
  category: string | { id: number; name: string; slug: string; icon?: string };
  tags: string[];
  image: string; gallery?: string[];
  fileUrl: string;
  variations: Variation[];
  featured?: boolean; newRelease?: boolean; bestSeller?: boolean;
  createdAt: number | string;
}
export interface Category { id: number | string; name: string; slug: string; icon?: string }
export interface CartItemData { productId: string | number; variationId?: string | null; qty: number }
export interface Cart { items: CartItemData[]; couponCode?: string | null }
export interface OrderItemData { productId: string | number; title: string; price: number; qty: number; variationName?: string | null; fileUrl: string }
export interface Order {
  id: number | string; userId: number | string; userName: string; userEmail: string;
  items: OrderItemData[]; subtotal: number; discount: number; total: number;
  status: OrderStatus;
  payment: { method: "stripe" | "crypto"; txid?: string; network?: string; cardLast4?: string };
  createdAt: number | string;
}
export interface Coupon {
  code: string; type: "percent" | "fixed"; value: number;
  expiresAt?: number | string; usageLimit?: number; usedCount: number;
}
export interface Review { id: number | string; productId: number | string; userId: number | string; userName: string; rating: number; text: string; approved: boolean; createdAt: number | string }
export interface BlogPost { id: number | string; slug: string; title: string; excerpt: string; content: string; cover: string; author: string; publishedAt: number | string }
export interface Testimonial { id: number | string; name: string; role: string; text: string; avatar?: string; rating: number }
export interface FAQ { id: number | string; question: string; answer: string }
export interface Pages { terms: string; privacy: string; refund: string; about: string; contact: string }
export interface CryptoNetwork { id: string; name: string; chain: string; address: string }
export interface Settings {
  brand: { name: string; logo?: string; favicon?: string; metaTitle: string; metaDesc: string };
  hero: { eyebrow: string; title: string; subtitle: string; ctaText: string };
  integrations: { ga4?: string; gtm?: string; metaPixel?: string; googleAdsId?: string; tiktokPixel?: string; clarityId?: string; headerScript?: string; footerScript?: string };
  payments: {
    stripe: { enabled: boolean; publishableKey?: string; secretKey?: string };
    crypto: { enabled: boolean; networks: CryptoNetwork[] };
  };
}
export interface ContactMessage { id: number | string; name: string; email: string; message: string; read: boolean; createdAt: number | string }

interface DB {
  users: User[]; sessionUserId: number | string | null;
  products: Product[]; categories: Category[]; tags: string[];
  orders: Order[]; coupons: Coupon[]; reviews: Review[];
  blog: BlogPost[]; testimonials: Testimonial[]; faqs: FAQ[];
  pages: Pages; settings: Settings; cart: Cart;
  contactMessages: ContactMessage[];
}

const KEY = "ds.v1";
const isBrowser = typeof window !== "undefined";

const seed = (): DB => ({
  users: [], sessionUserId: null,
  categories: [], tags: [],
  products: [], orders: [], coupons: [],
  reviews: [], blog: [], testimonials: [], faqs: [],
  pages: { terms: "", privacy: "", refund: "", about: "", contact: "" },
  settings: {
    brand: { name: "PixelMart", metaTitle: "PixelMart — Premium Digital Products", metaDesc: "" },
    hero: { eyebrow: "", title: "", subtitle: "", ctaText: "Shop products" },
    integrations: {},
    payments: { stripe: { enabled: true, publishableKey: "", secretKey: "" }, crypto: { enabled: false, networks: [] } },
  },
  cart: { items: [] },
  contactMessages: [],
});

let db: DB = seed();

// hydrate from localStorage fallback immediately (fast boot)
if (isBrowser) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) db = { ...seed(), ...JSON.parse(raw) };
  } catch {}
}

let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  db = {
    ...db,
    users: [...db.users],
    products: [...db.products],
    categories: [...db.categories],
    tags: [...db.tags],
    orders: [...db.orders],
    coupons: [...db.coupons],
    reviews: [...db.reviews],
    blog: [...db.blog],
    testimonials: [...db.testimonials],
    faqs: [...db.faqs],
    pages: { ...db.pages },
    settings: { ...db.settings },
    cart: { ...db.cart, items: [...db.cart.items] },
    contactMessages: [...(db.contactMessages ?? [])],
  };
  if (isBrowser) localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((l) => l());
}

// ------- hydrate from API -------
async function fetchPublicData() {
  try {
    const res = await api.get<any>("/api/data");
    const d = res;
    const cats = (d.categories || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }));
    const products = (d.products || []).map((p: any) => ({
      id: p.id, slug: p.slug, title: p.title, description: p.description,
      price: parseFloat(p.price), salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
      category: p.category?.slug || p.category_id,
      tags: p.tags || [], image: p.image, gallery: p.gallery, fileUrl: p.file_url,
      variations: p.variations || [], featured: p.featured, newRelease: p.new_release, bestSeller: p.best_seller,
      createdAt: p.created_at,
    }));
    const blog = (d.blog || []).map((b: any) => ({
      id: b.id, slug: b.slug, title: b.title, excerpt: b.excerpt, content: b.content,
      cover: b.cover, author: b.author, publishedAt: b.published_at,
    }));
    return {
      products, categories: cats, tags: [...new Set(products.flatMap((p: any) => p.tags || []))],
      blog, testimonials: d.testimonials || [], faqs: d.faqs || [],
      pages: d.pages || seed().pages, settings: d.settings || seed().settings,
    };
  } catch {
    return null;
  }
}

async function hydrateFromApi() {
  const data = await fetchPublicData();
  if (!data) return; // keep localStorage fallback
  db = { ...db, ...data };
  emit();
}

export function hydrate() {
  if (!isBrowser || hydrated) return;
  hydrated = true;
  if (isBrowser) {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) db = { ...seed(), ...JSON.parse(raw) };
    } catch {}
  }
  hydrateFromApi();
}

export function subscribe(fn: () => void) {
  if (isBrowser && !hydrated) hydrate();
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function snapshot(): DB { return db; }

function shallowEq(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.is(a[k], b[k])) return false;
  return true;
}
export function useStore<T>(selector: (s: DB) => T): T {
  return useSyncExternalStoreWithSelector(subscribe, () => db, () => db, selector, shallowEq);
}

// ---------- Auth ----------
export const auth = {
  async signup(name: string, email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>("/api/auth/signup", { name, email, password });
    setToken(res.token);
    const u = res.user;
    db.users = db.users.filter((x) => x.email !== u.email); // remove seed duplicate
    db.users.push(u);
    db.sessionUserId = u.id;
    emit();
    return u;
  },
  async login(email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>("/api/auth/login", { email, password });
    setToken(res.token);
    const u = res.user;
    if (!db.users.find((x) => x.id === u.id)) db.users.push(u);
    db.sessionUserId = u.id;
    emit();
    return u;
  },
  async logout() {
    try { await api.post("/api/auth/logout"); } catch {}
    setToken(null);
    db.sessionUserId = null;
    emit();
  },
  async forgot(email: string) {
    await api.post("/api/auth/forgot", { email });
    return true;
  },
  current(): User | null {
    return db.users.find((u) => u.id === db.sessionUserId) ?? null;
  },
  async updateProfile(patch: Partial<User>) {
    const res = await api.put<{ user: User }>("/api/auth/profile", patch);
    const u = res.user;
    const idx = db.users.findIndex((x) => x.id === u.id);
    if (idx >= 0) db.users[idx] = u;
    emit();
  },
};

// ---------- Cart ----------
export const cart = {
  async add(productId: string | number, variationId?: string, qty = 1) {
    try { await api.post("/api/cart/add", { product_id: productId, variation_id: variationId || null, qty }); } catch {}
    const items = db.cart.items.slice();
    const idx = items.findIndex((i) => i.productId === productId && i.variationId === variationId);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ productId, variationId: variationId || null, qty });
    db.cart = { ...db.cart, items };
    emit();
    cartDrawer.open();
  },
  async remove(productId: string | number, variationId?: string) {
    try { await api.post("/api/cart/remove", { product_id: productId, variation_id: variationId || null }); } catch {}
    db.cart = { ...db.cart, items: db.cart.items.filter((i) => !(i.productId === productId && i.variationId === (variationId || null))) };
    emit();
  },
  async setQty(productId: string | number, variationId: string | undefined, qty: number) {
    try { await api.post("/api/cart/set-qty", { product_id: productId, variation_id: variationId || null, qty }); } catch {}
    db.cart = { ...db.cart, items: db.cart.items.map((i) => i.productId === productId && i.variationId === (variationId || null) ? { ...i, qty: Math.max(1, qty) } : i) };
    emit();
  },
  async clear() {
    try { await api.post("/api/cart/clear"); } catch {}
    db.cart = { items: [] };
    emit();
  },
  async applyCoupon(code: string) {
    await api.post("/api/cart/coupon", { code });
    db.cart = { ...db.cart, couponCode: code };
    emit();
  },
  async removeCoupon() {
    try { await api.delete("/api/cart/coupon"); } catch {}
    db.cart = { ...db.cart, couponCode: undefined };
    emit();
  },
};

export function totals(c: Cart = db.cart) {
  const items = c.items.map((it) => {
    const p = db.products.find((x) => x.id === it.productId);
    if (!p) return { product: null, variation: null, qty: it.qty, line: 0, unit: 0 };
    const variations = (p as any).variations || [];
    const v = it.variationId ? variations.find((x: any) => x.id === it.variationId) : undefined;
    const price = v?.price ?? (p as any).salePrice ?? (p as any).price ?? 0;
    return { product: p, variation: v, qty: it.qty, line: price * it.qty, unit: price };
  });
  const subtotal = items.reduce((s, i) => s + i.line, 0);
  let discount = 0;
  const coupon = c.couponCode ? db.coupons.find((x) => x.code === c.couponCode) : undefined;
  if (coupon) discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : Math.min(subtotal, coupon.value);
  return { items, subtotal, discount, total: Math.max(0, subtotal - discount), coupon };
}

// ---------- Orders ----------
export const orders = {
  async create(payment: Order["payment"]) {
    const user = auth.current(); if (!user) throw new Error("Login required");
    const t = totals(); if (!t.items.length) throw new Error("Cart is empty");
    const res = await api.post<{ order: Order }>("/api/orders", { payment });
    const o = res.order;
    db.orders.unshift(o);
    if (t.coupon) t.coupon.usedCount += 1;
    db.cart = { items: [] };
    emit();
    return o;
  },
  async setStatus(id: number | string, status: OrderStatus) {
    try { await api.put(`/api/admin/orders/${id}/status`, { status }); } catch {}
    db.orders = db.orders.map((o) => (o.id === id ? { ...o, status } : o));
    emit();
  },
  forUser(userId: number | string) { return db.orders.filter((o) => o.userId === userId); },
  delivered(userId: number | string) { return db.orders.filter((o) => o.userId === userId && o.status === "Delivered"); },
};

// ---------- Admin CRUD ----------
function upsert<T extends { id: any }>(arr: T[], item: T) {
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) arr[i] = item; else arr.push(item);
}
export const admin = {
  async saveProduct(p: any) {
    const payload: any = {
      title: p.title, slug: p.slug, description: p.description,
      price: p.price, sale_price: p.salePrice, category_id: p.category_id || p.category,
      tags: p.tags, image: p.image, gallery: p.gallery, file_url: p.fileUrl,
      variations: p.variations, featured: p.featured, new_release: p.newRelease, best_seller: p.bestSeller,
    };
    if (p.id) payload.id = p.id;
    const res = await api.post<{ product: any }>("/api/admin/products", payload);
    if (!p.id) p.id = res.product.id;
    upsert(db.products as any, p);
    emit();
  },
  async deleteProduct(id: number | string) {
    try { await api.delete(`/api/admin/products/${id}`); } catch {}
    db.products = db.products.filter((p) => p.id !== id);
    emit();
  },
  async saveCategory(c: any) {
    const payload: any = { name: c.name, slug: c.slug, icon: c.icon };
    if (c.id) payload.id = c.id;
    const res = await api.post<{ category: any }>("/api/admin/categories", payload);
    if (!c.id) c.id = res.category.id;
    upsert(db.categories as any, c);
    emit();
  },
  async deleteCategory(id: number | string) {
    try { await api.delete(`/api/admin/categories/${id}`); } catch {}
    db.categories = db.categories.filter((c) => c.id !== id);
    emit();
  },
  async saveTags(tags: string[]) {
    try { await api.post("/api/admin/tags", { tags }); } catch {}
    db.tags = tags;
    emit();
  },
  async saveCoupon(c: Coupon) {
    await api.post("/api/admin/coupons", c);
    const i = db.coupons.findIndex((x) => x.code === c.code);
    if (i >= 0) db.coupons[i] = c; else db.coupons.push(c);
    emit();
  },
  async deleteCoupon(code: string) {
    try { await api.delete(`/api/admin/coupons/${code}`); } catch {}
    db.coupons = db.coupons.filter((c) => c.code !== code);
    emit();
  },
  async saveReview(r: any) {
    const res = await api.post<{ review: any }>("/api/admin/reviews", r);
    if (!r.id) r.id = res.review.id;
    upsert(db.reviews as any, r);
    emit();
  },
  async deleteReview(id: number | string) {
    try { await api.delete(`/api/admin/reviews/${id}`); } catch {}
    db.reviews = db.reviews.filter((r) => r.id !== id);
    emit();
  },
  async saveBlog(p: any) {
    const payload: any = { title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, cover: p.cover, author: p.author };
    if (p.id) payload.id = p.id;
    const res = await api.post<{ post: any }>("/api/admin/blog", payload);
    if (!p.id) p.id = res.post.id;
    upsert(db.blog as any, p);
    emit();
  },
  async deleteBlog(id: number | string) {
    try { await api.delete(`/api/admin/blog/${id}`); } catch {}
    db.blog = db.blog.filter((b) => b.id !== id);
    emit();
  },
  async saveTestimonial(t: any) {
    const payload: any = { name: t.name, role: t.role, text: t.text, avatar: t.avatar, rating: t.rating };
    if (t.id) payload.id = t.id;
    const res = await api.post<{ testimonial: any }>("/api/admin/testimonials", payload);
    if (!t.id) t.id = res.testimonial.id;
    upsert(db.testimonials as any, t);
    emit();
  },
  async deleteTestimonial(id: number | string) {
    try { await api.delete(`/api/admin/testimonials/${id}`); } catch {}
    db.testimonials = db.testimonials.filter((x) => x.id !== id);
    emit();
  },
  async saveFaq(f: any) {
    const payload: any = { question: f.question, answer: f.answer };
    if (f.id) payload.id = f.id;
    const res = await api.post<{ faq: any }>("/api/admin/faqs", payload);
    if (!f.id) f.id = res.faq.id;
    upsert(db.faqs as any, f);
    emit();
  },
  async deleteFaq(id: number | string) {
    try { await api.delete(`/api/admin/faqs/${id}`); } catch {}
    db.faqs = db.faqs.filter((x) => x.id !== id);
    emit();
  },
  async savePages(pages: Pages) {
    const arr = Object.entries(pages).map(([key, content]) => ({ key, content }));
    await api.post("/api/admin/pages", { pages: arr });
    db.pages = pages;
    emit();
  },
  async saveUser(u: any) {
    const payload: any = { name: u.name, email: u.email, role: u.role, status: u.status, billing: u.billing };
    if (u.id) payload.id = u.id;
    if (u.password) payload.password = u.password;
    const res = await api.post<{ user: any }>("/api/admin/users", payload);
    if (!u.id) u.id = res.user.id;
    upsert(db.users as any, u);
    emit();
  },
  async deleteUser(id: number | string) {
    try { await api.delete(`/api/admin/users/${id}`); } catch {}
    db.users = db.users.filter((u) => u.id !== id);
    emit();
  },
  async setUserStatus(id: number | string, s: UserStatus) {
    try { await api.put(`/api/admin/users/${id}/status`, { status: s }); } catch {}
    const u = db.users.find((x) => x.id === id);
    if (u) { u.status = s; emit(); }
  },
  async saveSettings(s: Settings) {
    await api.post("/api/admin/settings", s);
    db.settings = s;
    emit();
  },
  async markMessageRead(id: number | string, read = true) {
    try { await api.put(`/api/admin/messages/${id}/read`, { read }); } catch {}
    const m = db.contactMessages.find((x: any) => x.id === id);
    if (m) { m.read = read; emit(); }
  },
  async deleteMessage(id: number | string) {
    try { await api.delete(`/api/admin/messages/${id}`); } catch {}
    db.contactMessages = db.contactMessages.filter((m: any) => m.id !== id);
    emit();
  },
};

export async function submitContactMessage(name: string, email: string, message: string) {
  const res = await api.post<{ message: ContactMessage }>("/api/contact", { name, email, message });
  const m = res.message;
  if (!db.contactMessages) db.contactMessages = [];
  db.contactMessages.unshift(m);
  emit();
  return m;
}

export async function addReview(productId: number | string, rating: number, text: string) {
  const u = auth.current(); if (!u) throw new Error("Login to review");
  const r: Review = { id: Date.now(), productId, userId: u.id, userName: u.name, rating, text, approved: false, createdAt: Date.now() };
  db.reviews.push(r);
  emit();
}

export function resetStore() { db = seed(); emit(); }

// ---------- Cart Drawer UI ----------
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
export const cartDrawer = {
  open() { drawerOpen = true; drawerListeners.forEach((l) => l()); },
  close() { drawerOpen = false; drawerListeners.forEach((l) => l()); },
  set(v: boolean) { drawerOpen = v; drawerListeners.forEach((l) => l()); },
};
export function useCartDrawer(): [boolean, (v: boolean) => void] {
  const o = useSyncExternalStoreWithSelector(
    (fn) => { drawerListeners.add(fn); return () => { drawerListeners.delete(fn); }; },
    () => drawerOpen,
    () => false,
    (s) => s,
    Object.is,
  );
  return [o, cartDrawer.set];
}
