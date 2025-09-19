import { create } from "zustand";
import { persist } from "zustand/middleware";
export type Variant = {
  variantID: number;
  quantity: number;
};

export type CartItem = {
  name: string;
  image: string;
  id: number;
  variant: Variant;
  price: number;
};

export type CartState = {
  cart: CartItem[];
  checkoutProgress: "cart-page" | "payment-page" | "confirmation-page";
  setCheckoutProgress: (
    val: "cart-page" | "payment-page" | "confirmation-page"
  ) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (val: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      cartOpen: false,
      setCartOpen: (val) => set({ cartOpen: val }),
      clearCart: () => set({ cart: [] }),
      checkoutProgress: "cart-page",
      setCheckoutProgress: (val) => set((state) => ({ checkoutProgress: val })),
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem.variant.variantID === item.variant.variantID
          );
          if (existingItem) {
            const updatedCart = state.cart.map((cartItem) =>
              cartItem.variant.variantID === item.variant.variantID
                ? {
                    ...cartItem,
                    variant: {
                      ...cartItem.variant,
                      quantity:
                        cartItem.variant.quantity + item.variant.quantity,
                    },
                  }
                : cartItem
            );
            return { cart: updatedCart };
          } else {
            return {
              cart: [...state.cart, { ...item, variant: { ...item.variant } }],
            };
          }
        }),

      removeFromCart: (item) =>
        set((state) => {
          const updatedCart = state.cart
            .map((cartItem) =>
              cartItem.variant.variantID === item.variant.variantID
                ? {
                    ...cartItem,
                    variant: {
                      ...cartItem.variant,
                      quantity: cartItem.variant.quantity - 1,
                    },
                  }
                : cartItem
            )
            .filter((cartItem) => cartItem.variant.quantity > 0);
          return { cart: updatedCart };
        }),
    }),
    { name: "cart-storage" }
  )
);
