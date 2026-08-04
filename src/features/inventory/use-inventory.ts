import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Product, ProductInput, Shop, ShopInput } from '@/types'
import * as inventoryApi from './inventory-api'

export const queryKeys = {
  shops: ['shops'] as const,
  products: ['products'] as const,
}

/* --------------------------------- reads --------------------------------- */

export function useShops() {
  return useQuery({ queryKey: queryKeys.shops, queryFn: inventoryApi.fetchShops })
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: inventoryApi.fetchProducts,
  })
}

/** Both collections at once, with a single combined loading/error state. */
export function useInventory() {
  const shopsQuery = useShops()
  const productsQuery = useProducts()

  const shops: Shop[] = shopsQuery.data ?? []
  const products: Product[] = productsQuery.data ?? []

  return {
    shops,
    products,
    isLoading: shopsQuery.isLoading || productsQuery.isLoading,
    isError: shopsQuery.isError || productsQuery.isError,
    error: shopsQuery.error ?? productsQuery.error,
    refetch: () => {
      void shopsQuery.refetch()
      void productsQuery.refetch()
    },
  }
}

/* ------------------------------- shop writes ------------------------------ */

export function useCreateShop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ShopInput) => inventoryApi.createShop(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shops }),
  })
}

export function useUpdateShop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ShopInput> }) =>
      inventoryApi.updateShop(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shops }),
  })
}

export function useDeleteShop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteShop(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shops }),
  })
}

/* ----------------------------- product writes ----------------------------- */

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => inventoryApi.createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      inventoryApi.updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}
