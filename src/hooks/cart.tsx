import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('marketplace:');
      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const index = products.findIndex(item => item.id === product.id);
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity + 1,
        };
        setProducts(newProducts);
        AsyncStorage.setItem('marketplace:', JSON.stringify(newProducts));
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          'marketplace:',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity + 1,
        };
        setProducts(newProducts);
        await AsyncStorage.setItem('marketplace:', JSON.stringify(products));
      } else {
        await AsyncStorage.setItem('marketplace:', JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = {
          ...newProducts[index],
          quantity:
            newProducts[index].quantity !== 0
              ? newProducts[index].quantity - 1
              : 0,
        };

        setProducts(newProducts);
        await AsyncStorage.setItem('marketplace:', JSON.stringify(products));
      } else {
        await AsyncStorage.setItem('marketplace:', JSON.stringify(products));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
