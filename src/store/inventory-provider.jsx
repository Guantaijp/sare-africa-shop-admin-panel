import { useCallback, useMemo, useState } from 'react'

import { seedProducts, seedShops } from '@/data/seed'
import { InventoryContext } from './inventory-context'

const newId = (prefix) =>
  `${prefix}-${
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  }`

export function InventoryProvider({ children }) {
  const [shops, setShops] = useState(seedShops)
  const [products, setProducts] = useState(seedProducts)

  /* ------------------------------- shops -------------------------------- */

  const createShop = useCallback((values) => {
    const shop = {
      ...values,
      id: newId('shop'),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setShops((prev) => [shop, ...prev])
    return shop
  }, [])

  const updateShop = useCallback((id, values) => {
    setShops((prev) =>
      prev.map((shop) => (shop.id === id ? { ...shop, ...values } : shop)),
    )
  }, [])

  // Refuses to delete a shop that still holds products; the caller surfaces
  // the reason to the user rather than silently no-opping.
  const deleteShop = useCallback(
    (id) => {
      const count = products.filter((p) => p.shopId === id).length
      if (count > 0) {
        return {
          ok: false,
          count,
          message: `This shop still has ${count} product${
            count === 1 ? '' : 's'
          }. Move or delete them before deleting the shop.`,
        }
      }
      setShops((prev) => prev.filter((shop) => shop.id !== id))
      return { ok: true, count: 0 }
    },
    [products],
  )

  /* ------------------------------ products ------------------------------ */

  const createProduct = useCallback((values) => {
    const product = {
      ...values,
      id: newId('p'),
      price: Number(values.price) || 0,
      stock: Number(values.stock) || 0,
    }
    setProducts((prev) => [product, ...prev])
    return product
  }, [])

  const updateProduct = useCallback((id, values) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...values,
              price: Number(values.price) || 0,
              stock: Number(values.stock) || 0,
            }
          : product,
      ),
    )
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }, [])

  /* ----------------------------- selectors ------------------------------ */

  const getShop = useCallback(
    (id) => shops.find((shop) => shop.id === id) ?? null,
    [shops],
  )

  const getShopProducts = useCallback(
    (id) => products.filter((product) => product.shopId === id),
    [products],
  )

  const countShopProducts = useCallback(
    (id) => products.reduce((n, p) => (p.shopId === id ? n + 1 : n), 0),
    [products],
  )

  const value = useMemo(
    () => ({
      shops,
      products,
      createShop,
      updateShop,
      deleteShop,
      createProduct,
      updateProduct,
      deleteProduct,
      getShop,
      getShopProducts,
      countShopProducts,
    }),
    [
      shops,
      products,
      createShop,
      updateShop,
      deleteShop,
      createProduct,
      updateProduct,
      deleteProduct,
      getShop,
      getShopProducts,
      countShopProducts,
    ],
  )

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}
