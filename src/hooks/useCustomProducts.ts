import { useCallback, useEffect, useState } from 'react';
import { readCustomProducts, writeCustomProducts } from '@/lib/customProducts';
import type { Product } from '@/lib/products';

export function useCustomProducts() {
  const [items, setItems] = useState<Product[]>(readCustomProducts);

  useEffect(() => {
    writeCustomProducts(items);
  }, [items]);

  const add = useCallback((product: Product) => {
    setItems((current) => [...current, product]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return { items, add, remove };
}
