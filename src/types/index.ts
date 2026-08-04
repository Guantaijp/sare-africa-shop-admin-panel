export type UserRole = 'admin' | 'manager'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

/** Shape stored in db.json — never let `password` reach the client session. */
export interface UserRecord extends User {
  password: string
}

export interface Shop {
  id: string
  name: string
  description: string
  location: string
  logo: string
  createdAt: string
}

export type ShopInput = Omit<Shop, 'id' | 'createdAt'>

export interface Product {
  id: string
  name: string
  shopId: string
  price: number
  stock: number
  description: string
  image: string
  sku: string
  category: string
}

export type ProductInput = Omit<Product, 'id'>

export type StockStatusKey = 'in' | 'low' | 'out'

export interface StockStatus {
  key: StockStatusKey
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface Credentials {
  email: string
  password: string
}
