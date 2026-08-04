import { api } from '@/lib/api'
import type { Product, ProductInput, Shop, ShopInput } from '@/types'

/* --------------------------------- shops --------------------------------- */

export async function fetchShops(): Promise<Shop[]> {
  const { data } = await api.get<Shop[]>('/shops')
  return data
}

export async function fetchShop(id: string): Promise<Shop> {
  const { data } = await api.get<Shop>(`/shops/${id}`)
  return data
}

export async function createShop(input: ShopInput): Promise<Shop> {
  const { data } = await api.post<Shop>('/shops', {
    ...input,
    createdAt: new Date().toISOString().slice(0, 10),
  })
  return data
}

export async function updateShop(
  id: string,
  input: Partial<ShopInput>,
): Promise<Shop> {
  const { data } = await api.patch<Shop>(`/shops/${id}`, input)
  return data
}

export async function deleteShop(id: string): Promise<void> {
  await api.delete(`/shops/${id}`)
}

/* -------------------------------- products -------------------------------- */

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products')
  return data
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/products', input)
  return data
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, input)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}
