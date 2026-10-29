import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, CartVendorGroup, Product } from '../lib/api/types';
import { siteConfig } from '../config/site.config';

interface CartState {
  cart: Cart;
  couponCode: string | null;
  discountPercentage: number;
  fixedDiscount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  syncWithBackend: () => Promise<void>;
  fetchServerCart: () => Promise<void>;
}

const DEFAULT_DELIVERY_FEE_PER_VENDOR = siteConfig.checkout.defaultDeliveryFeePerMerchant;
const PLATFORM_SERVICE_FEE_PER_VENDOR = siteConfig.checkout.platformServiceFeePerOrder;

function recalculateCart(
  items: CartItem[],
  discountPct: number = 0,
  fixedDiscount: number = 0
): Cart {
  // Group by merchant ID
  const groupsMap = new Map<string, CartItem[]>();
  for (const item of items) {
    const mId = item.product.merchantId || item.product.merchant?.id || 'default-vendor';
    const existing = groupsMap.get(mId) || [];
    existing.push(item);
    groupsMap.set(mId, existing);
  }

  let subtotal = 0;
  let totalDeliveryFee = 0;
  let platformServiceFee = 0;
  const vendorGroups: CartVendorGroup[] = [];

  groupsMap.forEach((groupItems, mId) => {
    const groupSubtotal = groupItems.reduce((acc, it) => acc + it.totalPrice, 0);
    const vendorName = groupItems[0]?.product.merchant?.storeName || 'المتجر المعتمد';
    const deliveryFee = DEFAULT_DELIVERY_FEE_PER_VENDOR;
    const servFee = PLATFORM_SERVICE_FEE_PER_VENDOR;

    subtotal += groupSubtotal;
    totalDeliveryFee += deliveryFee;
    platformServiceFee += servFee;

    vendorGroups.push({
      merchantId: mId,
      merchantName: vendorName,
      items: groupItems,
      subtotal: groupSubtotal,
      estimatedDeliveryFee: deliveryFee,
      estimatedDeliveryEta: 'خلال 2 - 4 ساعات (نفس اليوم)',
    });
  });

  let calculatedDiscount = 0;
  if (discountPct > 0) {
    calculatedDiscount = Math.round((subtotal * discountPct) / 100);
  } else if (fixedDiscount > 0) {
    calculatedDiscount = Math.min(fixedDiscount, subtotal);
  }

  const totalAmount = Math.max(0, subtotal - calculatedDiscount + totalDeliveryFee + platformServiceFee);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return {
    items,
    vendorGroups,
    subtotal,
    totalDeliveryFee,
    platformServiceFee,
    discountAmount: calculatedDiscount,
    totalAmount,
    itemCount,
  };
}

const initialCart: Cart = {
  items: [],
  vendorGroups: [],
  subtotal: 0,
  totalDeliveryFee: 0,
  platformServiceFee: 0,
  discountAmount: 0,
  totalAmount: 0,
  itemCount: 0,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: initialCart,
      couponCode: null,
      discountPercentage: 0,
      fixedDiscount: 0,

      addItem: (product: Product, quantity = 1) => {
        const { cart, discountPercentage, fixedDiscount } = get();
        const existingIdx = cart.items.findIndex((it) => it.productId === product.id);
        let newItems: CartItem[];

        if (existingIdx > -1) {
          newItems = cart.items.map((it, idx) => {
            if (idx === existingIdx) {
              const newQty = it.quantity + quantity;
              return {
                ...it,
                quantity: newQty,
                totalPrice: Math.round(it.unitPrice * newQty * 100) / 100,
              };
            }
            return it;
          });
        } else {
          const unitPrice = product.price;
          newItems = [
            ...cart.items,
            {
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: product.id,
              product,
              quantity,
              unitPrice,
              totalPrice: Math.round(unitPrice * quantity * 100) / 100,
            },
          ];
        }

        set({ cart: recalculateCart(newItems, discountPercentage, fixedDiscount) });

        // Non-blocking sync with server session if authenticated
        if (typeof window !== 'undefined') {
          fetch('/api/cart/item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: product.id, quantity }),
          }).catch(() => {});
        }
      },

      removeItem: (productId: string) => {
        const { cart, discountPercentage, fixedDiscount } = get();
        const newItems = cart.items.filter((it) => it.productId !== productId);
        set({ cart: recalculateCart(newItems, discountPercentage, fixedDiscount) });

        if (typeof window !== 'undefined') {
          fetch(`/api/cart/item?product_id=${encodeURIComponent(productId)}`, {
            method: 'DELETE',
          }).catch(() => {});
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const { cart, discountPercentage, fixedDiscount } = get();
        const newItems = cart.items.map((it) => {
          if (it.productId === productId) {
            return {
              ...it,
              quantity,
              totalPrice: Math.round(it.unitPrice * quantity * 100) / 100,
            };
          }
          return it;
        });
        set({ cart: recalculateCart(newItems, discountPercentage, fixedDiscount) });

        if (typeof window !== 'undefined') {
          fetch('/api/cart/item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity }),
          }).catch(() => {});
        }
      },

      clearCart: () => {
        set({ cart: initialCart, couponCode: null, discountPercentage: 0, fixedDiscount: 0 });

        if (typeof window !== 'undefined') {
          fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
        }
      },

      syncWithBackend: async () => {
        try {
          const { cart, couponCode } = get();
          if (cart.items.length > 0) {
            const payload = {
              items: cart.items.map((it) => ({
                product_id: it.productId,
                quantity: it.quantity,
              })),
              coupon_code: couponCode || undefined,
            };
            const res = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const json = await res.json();
              if (json.data && json.data.items && json.data.items.length > 0) {
                const transformedItems: CartItem[] = json.data.items.map((dbItem: any) => ({
                  id: dbItem.id,
                  productId: dbItem.product_id,
                  product: dbItem.product,
                  quantity: dbItem.quantity,
                  unitPrice: Number(dbItem.product?.price || 0),
                  totalPrice: Math.round(Number(dbItem.product?.price || 0) * dbItem.quantity * 100) / 100,
                }));
                set({
                  cart: recalculateCart(transformedItems, get().discountPercentage, get().fixedDiscount),
                });
              }
            }
          } else {
            await get().fetchServerCart();
          }
        } catch (err) {
          console.error('Error syncing cart with backend:', err);
        }
      },

      fetchServerCart: async () => {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.items && json.data.items.length > 0) {
              const transformedItems: CartItem[] = json.data.items.map((dbItem: any) => ({
                id: dbItem.id,
                productId: dbItem.product_id,
                product: dbItem.product,
                quantity: dbItem.quantity,
                unitPrice: Number(dbItem.product?.price || 0),
                totalPrice: Math.round(Number(dbItem.product?.price || 0) * dbItem.quantity * 100) / 100,
              }));
              set({
                couponCode: json.data.coupon_code || null,
                cart: recalculateCart(transformedItems, get().discountPercentage, get().fixedDiscount),
              });
            }
          }
        } catch (err) {
          console.error('Error fetching server cart:', err);
        }
      },

      applyCoupon: async (code: string) => {
        const clean = code.trim().toUpperCase();
        if (!clean) {
          return { success: false, message: 'يرجى إدخال كود الخصم' };
        }

        const subtotal = get().cart.subtotal;

        try {
          const res = await fetch('/api/offers/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: clean, subtotal }),
          });

          const json = await res.json();

          if (!res.ok || !json.success) {
            return {
              success: false,
              message: json.message || 'كود الخصم غير صحيح أو منتهي الصلاحية',
            };
          }

          const offer = json.data;
          const isPercentage = offer.discount_type === 'percentage';
          const discountPct = isPercentage ? Number(offer.discount_value) : 0;
          const fixedAmt = !isPercentage ? Number(offer.discount_value) : 0;

          set({
            couponCode: clean,
            discountPercentage: discountPct,
            fixedDiscount: fixedAmt,
            cart: recalculateCart(get().cart.items, discountPct, fixedAmt),
          });

          return {
            success: true,
            message: json.message || `تم تفعيل كود الخصم ${clean} بنجاح`,
          };
        } catch {
          return { success: false, message: 'تعذر التحقق من كود الخصم، يرجى المحاولة لاحقاً' };
        }
      },

      removeCoupon: () => {
        set({
          couponCode: null,
          discountPercentage: 0,
          fixedDiscount: 0,
          cart: recalculateCart(get().cart.items, 0, 0),
        });
      },
    }),
    {
      name: 'otlob_cart_storage',
    }
  )
);
