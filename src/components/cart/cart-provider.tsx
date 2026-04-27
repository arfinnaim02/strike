"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
  size?: string | null;
  color?: string | null;
  sleeveType?: string | null;
  edition?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (variantId: string) => void;
  increaseQty: (variantId: string) => void;
  decreaseQty: (variantId: string) => void;
  clearCart: () => void;
  getItemQty: (variantId: string) => number;
  totalItems: number;
  subtotal: number;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("strike-cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("strike-cart", JSON.stringify(items));
  }, [items]);

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  function toggleCart() {
    setIsCartOpen((prev) => !prev);
  }

  function addItem(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const existing = prev.find((x) => x.variantId === item.variantId);

      if (existing) {
        return prev.map((x) =>
          x.variantId === item.variantId ? { ...x, qty: x.qty + 1 } : x
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });

    openCart();
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((x) => x.variantId !== variantId));
  }

  function increaseQty(variantId: string) {
    setItems((prev) =>
      prev.map((x) =>
        x.variantId === variantId ? { ...x, qty: x.qty + 1 } : x
      )
    );
  }

  function decreaseQty(variantId: string) {
    setItems((prev) =>
      prev
        .map((x) =>
          x.variantId === variantId ? { ...x, qty: Math.max(0, x.qty - 1) } : x
        )
        .filter((x) => x.qty > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  function getItemQty(variantId: string) {
    const item = items.find((x) => x.variantId === variantId);
    return item ? item.qty : 0;
  }

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseQty,
        decreaseQty,
        clearCart,
        getItemQty,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}