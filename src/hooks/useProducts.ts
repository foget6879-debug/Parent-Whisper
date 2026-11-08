import { useCallback, useEffect, useState } from 'react';
import { fetchProducts, type Product } from '@/lib/products';

export type ProductsState =
  | { status: 'loading' }
  | { status: 'ready'; products: Product[] }
  | { status: 'error'; message: string };

export function useProducts() {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });

  const load = useCallback(() => {
    setState({ status: 'loading' });
    fetchProducts()
      .then((products) => setState({ status: 'ready', products }))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Невідома помилка.';
        setState({ status: 'error', message });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
