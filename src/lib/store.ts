// Local-storage backed store. Swap with API later.
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

export type Role = "admin" | "customer";
export type UserStatus = "active" | "suspended" | "banned";
export type OrderStatus = "Pending" | "In Progress" | "Ready For Delivery" | "Delivered" | "Refunded";

export interface User {
  id: string; name: string; email: string; password: string;
  role: Role; status: UserStatus; verified: boolean;
  billing?: { country?: string; address?: string; city?: string; zip?: string };
  createdAt: number;
}
export interface Variation { id: string; name: string; price: number }
export interface Product {
  id: string; slug: string; title: string; description: string;
  price: number; salePrice?: number;
  category: string; tags: string[];
  image: string; gallery?: string[];
  fileUrl: string; // download link
  variations: Variation[];
  featured?: boolean; newRelease?: boolean; bestSeller?: boolean;
  createdAt: number;
}
export interface Category { id: string; name: string; slug: string; icon?: string }
export interface CartItem { productId: string; variationId?: string; qty: number }
export interface Cart { items: CartItem[]; couponCode?: string }
export interface OrderItem { productId: string; title: string; price: number; qty: number; variationName?: string; fileUrl: string }
export interface Order {
  id: string; userId: string; userName: string; userEmail: string;
  items: OrderItem[]; subtotal: number; discount: number; total: number;
  status: OrderStatus;
  payment: { method: "stripe" | "crypto"; txid?: string; network?: string; cardLast4?: string };
  createdAt: number;
}
export interface Coupon {
  code: string; type: "percent" | "fixed"; value: number;
  expiresAt?: number; usageLimit?: number; usedCount: number;
}
export interface Review { id: string; productId: string; userId: string; userName: string; rating: number; text: string; approved: boolean; createdAt: number }
export interface BlogPost { id: string; slug: string; title: string; excerpt: string; content: string; cover: string; author: string; publishedAt: number }
export interface Testimonial { id: string; name: string; role: string; text: string; avatar?: string; rating: number }
export interface FAQ { id: string; question: string; answer: string }
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

export interface ContactMessage { id: string; name: string; email: string; message: string; read: boolean; createdAt: number }

interface DB {
  users: User[]; sessionUserId: string | null;
  products: Product[]; categories: Category[]; tags: string[];
  orders: Order[]; coupons: Coupon[]; reviews: Review[];
  blog: BlogPost[]; testimonials: Testimonial[]; faqs: FAQ[];
  pages: Pages; settings: Settings; cart: Cart;
  contactMessages: ContactMessage[];
}

const KEY = "ds.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const seed = (): DB => ({
  users: [
    { id: "u-admin", name: "Admin", email: "admin@demo.com", password: "admin123", role: "admin", status: "active", verified: true, createdAt: Date.now() - 86400000 * 30 },
    { id: "u-jane", name: "Jane Customer", email: "jane@demo.com", password: "jane1234", role: "customer", status: "active", verified: true, createdAt: Date.now() - 86400000 * 10 },
  ],
  sessionUserId: null,
  categories: [
    { id: "c1", name: "Templates", slug: "templates", icon: "📄" },
    { id: "c2", name: "Ebooks", slug: "ebooks", icon: "📚" },
    { id: "c3", name: "Software", slug: "software", icon: "💻" },
    { id: "c4", name: "Graphics", slug: "graphics", icon: "🎨" },
    { id: "c5", name: "Courses", slug: "courses", icon: "🎓" },
  ],
  tags: ["new", "trending", "premium", "popular", "starter"],
  products: [
    { id: "p1", slug: "notion-productivity-os", title: "Notion Productivity OS", description: "All-in-one productivity workspace template for Notion. Includes tasks, projects, habits, journal, and weekly review dashboard.", price: 49, salePrice: 29, category: "templates", tags: ["new", "trending"], image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800", fileUrl: "https://example.com/files/notion-os.zip", variations: [{ id: "v1", name: "Personal", price: 29 }, { id: "v2", name: "Team", price: 79 }], featured: true, newRelease: true, bestSeller: true, createdAt: Date.now() - 86400000 * 5 },
    { id: "p2", slug: "ai-prompt-pack", title: "Ultimate AI Prompt Pack", description: "1000+ curated prompts for marketing, sales, coding and creative writing across ChatGPT, Claude and Gemini.", price: 19, category: "ebooks", tags: ["popular"], image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800", fileUrl: "https://example.com/files/prompts.pdf", variations: [], featured: true, bestSeller: true, createdAt: Date.now() - 86400000 * 8 },
    { id: "p3", slug: "indie-saas-starter", title: "Indie SaaS Starter Kit", description: "Production-ready Next.js + Stripe + Auth boilerplate to ship your SaaS in a weekend.", price: 99, salePrice: 69, category: "software", tags: ["premium"], image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800", fileUrl: "https://example.com/files/saas-kit.zip", variations: [], featured: true, newRelease: true, createdAt: Date.now() - 86400000 * 2 },
    { id: "p4", slug: "icon-pack-pro", title: "Icon Pack Pro — 2000 Icons", description: "2000+ pixel-perfect SVG icons in 6 styles. Figma + sprite + React components.", price: 29, category: "graphics", tags: ["trending"], image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800", fileUrl: "https://example.com/files/icons.zip", variations: [], bestSeller: true, createdAt: Date.now() - 86400000 * 20 },
    { id: "p5", slug: "youtube-growth-course", title: "YouTube Growth Course", description: "12-hour course on growing a YouTube channel from 0 to 100k subs. Lifetime updates.", price: 149, salePrice: 99, category: "courses", tags: ["premium"], image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800", fileUrl: "https://example.com/files/yt-course.zip", variations: [], featured: true, createdAt: Date.now() - 86400000 * 15 },
    { id: "p6", slug: "minimal-resume-templates", title: "Minimal Resume Templates", description: "12 clean resume templates in Word, Pages, and Figma formats.", price: 15, category: "templates", tags: ["starter"], image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800", fileUrl: "https://example.com/files/resume.zip", variations: [], newRelease: true, createdAt: Date.now() - 86400000 * 1 },
  ],
  orders: [],
  coupons: [
    { code: "WELCOME10", type: "percent", value: 10, usageLimit: 100, usedCount: 3 },
    { code: "SAVE5", type: "fixed", value: 5, usedCount: 0 },
  ],
  reviews: [
    { id: "r1", productId: "p1", userId: "u-jane", userName: "Jane C.", rating: 5, text: "Game changer for my workflow!", approved: true, createdAt: Date.now() - 86400000 * 2 },
    { id: "r2", productId: "p2", userId: "u-jane", userName: "Jane C.", rating: 4, text: "Massive value for the price.", approved: true, createdAt: Date.now() - 86400000 * 3 },
  ],
  blog: [
    { id: "b1", slug: "selling-digital-products-2026", title: "Selling Digital Products in 2026: What's Working", excerpt: "The playbook for creators shipping templates, ebooks and SaaS in the AI era.", content: "Long-form content here. Replace from the admin panel.", cover: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200", author: "Admin", publishedAt: Date.now() - 86400000 * 3 },
    { id: "b2", slug: "stripe-vs-crypto-payments", title: "Stripe vs Crypto: Which Should You Offer?", excerpt: "A practical comparison of cards and on-chain payments for digital sellers.", content: "Long-form content here.", cover: "https://images.unsplash.com/photo-1620266757065-5814239881fd?w=1200", author: "Admin", publishedAt: Date.now() - 86400000 * 10 },
  ],
  testimonials: [
    { id: "t1", name: "Sarah K.", role: "Designer", text: "Best store I've bought templates from. Instant delivery and great support.", rating: 5 },
    { id: "t2", name: "Marcus D.", role: "Indie Hacker", text: "The SaaS Starter saved me weeks. Solid quality.", rating: 5 },
    { id: "t3", name: "Priya R.", role: "Marketer", text: "The prompt pack pays for itself in one day.", rating: 5 },
  ],
  faqs: [
    { id: "f1", question: "How do I receive my purchase?", answer: "Instantly — your download link appears in your dashboard and is emailed to you after checkout." },
    { id: "f2", question: "Do you offer refunds?", answer: "Yes, within 7 days if the product doesn't match its description. See our Refund Policy." },
    { id: "f3", question: "Can I pay with crypto?", answer: "Yes, we accept multiple networks. Choose Crypto at checkout and submit your TXID." },
    { id: "f4", question: "Is there a license for commercial use?", answer: "Most products include a commercial license. Check the product page for specifics." },
  ],
  pages: {
    terms: "# Terms & Conditions\n\nBy using this site you agree to our terms. Replace this content from the admin panel.",
    privacy: "# Privacy Policy\n\nWe respect your privacy. Replace this content from the admin panel.",
    refund: "# Refund & Return Policy\n\nDigital products are refundable within 7 days. Replace this content from the admin panel.",
    about: "# About Us\n\nWe're a small team building tools and templates for creators.",
    contact: "# Contact Us\n\nEmail us at support@demo.com — we reply within 24 hours.",
  },
  settings: {
    brand: { name: "PixelMart", metaTitle: "PixelMart — Premium Digital Products", metaDesc: "Templates, ebooks, software and courses for creators and founders." },
    hero: { eyebrow: "Premium Digital Goods", title: "Build faster with battle-tested digital products", subtitle: "Templates, ebooks, software and courses crafted by working pros. Instant download, lifetime updates.", ctaText: "Shop products" },
    integrations: {},
    payments: {
      stripe: { enabled: true, publishableKey: "", secretKey: "" },
      crypto: { enabled: true, networks: [
        { id: "n1", name: "USDT", chain: "TRC20", address: "TXxxxx...demoaddress" },
        { id: "n2", name: "BTC", chain: "Bitcoin", address: "bc1qxxxx...demoaddress" },
        { id: "n3", name: "ETH", chain: "ERC20", address: "0xabcd...demoaddress" },
      ] },
    },
  },
  cart: { items: [] },
  contactMessages: [],
});

let db: DB = seed();
const isBrowser = typeof window !== "undefined";

// Eagerly hydrate from localStorage at module load so refresh on protected
// pages (e.g. /admin) doesn't redirect before session is restored.
if (isBrowser) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { db = { ...seed(), ...JSON.parse(raw) }; if (!db.contactMessages) db.contactMessages = []; }
  } catch {}
}

function save() { if (isBrowser) localStorage.setItem(KEY, JSON.stringify(db)); }

let hydrated = false;
export function hydrate() {
  if (!isBrowser || hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(db)); }
    else { db = { ...seed(), ...JSON.parse(raw) }; if (!db.contactMessages) db.contactMessages = []; }
  } catch {}
  listeners.forEach((l) => l());
}

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
  save();
  listeners.forEach((l) => l());
}
export function subscribe(fn: () => void) {
  // Hydrate on first subscribe (client-only) so SSR markup matches initial client render.
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
  signup(name: string, email: string, password: string) {
    if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
    const u: User = { id: "u-" + uid(), name, email, password, role: "customer", status: "active", verified: false, createdAt: Date.now() };
    db.users.push(u); db.sessionUserId = u.id; emit(); return u;
  },
  login(email: string, password: string) {
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) throw new Error("Invalid credentials");
    if (u.status !== "active") throw new Error("Account " + u.status);
    db.sessionUserId = u.id; emit(); return u;
  },
  logout() { db.sessionUserId = null; emit(); },
  forgot(email: string) {
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error("No account with that email");
    return true;
  },
  verify(userId: string) { const u = db.users.find((x) => x.id === userId); if (u) { u.verified = true; emit(); } },
  current(): User | null { return db.users.find((u) => u.id === db.sessionUserId) ?? null; },
  updateProfile(patch: Partial<User>) {
    const u = auth.current(); if (!u) return;
    Object.assign(u, patch); emit();
  },
};

// ---------- Cart ----------
export const cart = {
  add(productId: string, variationId?: string, qty = 1) {
    const items = db.cart.items.slice();
    const idx = items.findIndex((i) => i.productId === productId && i.variationId === variationId);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ productId, variationId, qty });
    db.cart = { ...db.cart, items };
    emit();
    cartDrawer.open();
  },
  remove(productId: string, variationId?: string) {
    const items = db.cart.items.filter((i) => !(i.productId === productId && i.variationId === variationId));
    db.cart = { ...db.cart, items };
    emit();
  },
  setQty(productId: string, variationId: string | undefined, qty: number) {
    const items = db.cart.items.map((i) =>
      i.productId === productId && i.variationId === variationId ? { ...i, qty: Math.max(1, qty) } : i,
    );
    db.cart = { ...db.cart, items };
    emit();
  },
  clear() { db.cart = { items: [] }; emit(); },
  applyCoupon(code: string) {
    const c = db.coupons.find((x) => x.code.toLowerCase() === code.toLowerCase());
    if (!c) throw new Error("Invalid coupon");
    if (c.expiresAt && c.expiresAt < Date.now()) throw new Error("Coupon expired");
    if (c.usageLimit && c.usedCount >= c.usageLimit) throw new Error("Coupon limit reached");
    db.cart = { ...db.cart, couponCode: c.code }; emit();
  },
  removeCoupon() { db.cart = { ...db.cart, couponCode: undefined }; emit(); },
};

export function totals(c: Cart = db.cart) {
  const items = c.items.map((it) => {
    const p = db.products.find((x) => x.id === it.productId)!;
    const v = it.variationId ? p.variations.find((x) => x.id === it.variationId) : undefined;
    const price = v?.price ?? p.salePrice ?? p.price;
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
  create(payment: Order["payment"]) {
    const user = auth.current(); if (!user) throw new Error("Login required");
    const t = totals(); if (!t.items.length) throw new Error("Cart is empty");
    const o: Order = {
      id: "O-" + Date.now().toString(36).toUpperCase(),
      userId: user.id, userName: user.name, userEmail: user.email,
      items: t.items.map((i) => ({ productId: i.product.id, title: i.product.title, price: i.unit, qty: i.qty, variationName: i.variation?.name, fileUrl: i.product.fileUrl })),
      subtotal: t.subtotal, discount: t.discount, total: t.total,
      status: "Pending", payment, createdAt: Date.now(),
    };
    if (t.coupon) t.coupon.usedCount += 1;
    db.orders.unshift(o);
    db.cart = { items: [] };
    emit();
    return o;
  },
  setStatus(id: string, status: OrderStatus) {
    db.orders = db.orders.map((o) => (o.id === id ? { ...o, status } : o));
    emit();
  },
  forUser(userId: string) { return db.orders.filter((o) => o.userId === userId); },
  delivered(userId: string) {
    return db.orders.filter((o) => o.userId === userId && o.status === "Delivered");
  },
};

// ---------- Admin CRUD helpers ----------
function upsert<T extends { id: string }>(arr: T[], item: T) {
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) arr[i] = item; else arr.push(item);
}
export const admin = {
  // products
  saveProduct(p: Product) { if (!p.id) p.id = "p-" + uid(); if (!p.slug) p.slug = p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); upsert(db.products, p); emit(); },
  deleteProduct(id: string) { db.products = db.products.filter((p) => p.id !== id); emit(); },
  // categories
  saveCategory(c: Category) { if (!c.id) c.id = "c-" + uid(); if (!c.slug) c.slug = c.name.toLowerCase().replace(/\s+/g, "-"); upsert(db.categories, c); emit(); },
  deleteCategory(id: string) { db.categories = db.categories.filter((c) => c.id !== id); emit(); },
  saveTags(tags: string[]) { db.tags = tags; emit(); },
  // coupons
  saveCoupon(c: Coupon) { const i = db.coupons.findIndex((x) => x.code === c.code); if (i >= 0) db.coupons[i] = c; else db.coupons.push(c); emit(); },
  deleteCoupon(code: string) { db.coupons = db.coupons.filter((c) => c.code !== code); emit(); },
  // reviews
  saveReview(r: Review) { upsert(db.reviews, r); emit(); },
  deleteReview(id: string) { db.reviews = db.reviews.filter((r) => r.id !== id); emit(); },
  // blog
  saveBlog(p: BlogPost) { if (!p.id) p.id = "b-" + uid(); if (!p.slug) p.slug = p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); upsert(db.blog, p); emit(); },
  deleteBlog(id: string) { db.blog = db.blog.filter((b) => b.id !== id); emit(); },
  // testimonials
  saveTestimonial(t: Testimonial) { if (!t.id) t.id = "t-" + uid(); upsert(db.testimonials, t); emit(); },
  deleteTestimonial(id: string) { db.testimonials = db.testimonials.filter((x) => x.id !== id); emit(); },
  // faqs
  saveFaq(f: FAQ) { if (!f.id) f.id = "f-" + uid(); upsert(db.faqs, f); emit(); },
  deleteFaq(id: string) { db.faqs = db.faqs.filter((x) => x.id !== id); emit(); },
  // pages
  savePages(p: Pages) { db.pages = p; emit(); },
  // users
  saveUser(u: User) { upsert(db.users, u); emit(); },
  deleteUser(id: string) { db.users = db.users.filter((u) => u.id !== id); emit(); },
  setUserStatus(id: string, s: UserStatus) { const u = db.users.find((x) => x.id === id); if (u) { u.status = s; emit(); } },
  // settings
  saveSettings(s: Settings) { db.settings = s; emit(); },
  // contact messages
  markMessageRead(id: string, read = true) { const m = db.contactMessages.find((x) => x.id === id); if (m) { m.read = read; emit(); } },
  deleteMessage(id: string) { db.contactMessages = db.contactMessages.filter((m) => m.id !== id); emit(); },
};

export function submitContactMessage(name: string, email: string, message: string) {
  if (!db.contactMessages) db.contactMessages = [];
  const m: ContactMessage = { id: "m-" + uid(), name, email, message, read: false, createdAt: Date.now() };
  db.contactMessages.unshift(m); emit(); return m;
}

export function addReview(productId: string, rating: number, text: string) {
  const u = auth.current(); if (!u) throw new Error("Login to review");
  const r: Review = { id: "r-" + uid(), productId, userId: u.id, userName: u.name, rating, text, approved: false, createdAt: Date.now() };
  db.reviews.push(r); emit();
}

export function resetStore() { db = seed(); emit(); }

// ---------- Cart Drawer (UI state) ----------
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
