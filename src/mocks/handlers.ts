import { HttpResponse, delay, http } from 'msw'

import { API_URL } from '@/lib/api'
import type { Product, ProductInput, Shop, ShopInput } from '@/types'
import { db, nextId, persist } from './db'

/** Enough latency for the loading skeletons to actually be visible. */
const LATENCY = 200

const notFound = () => new HttpResponse(null, { status: 404 })

export const handlers = [
  /* --------------------------------- auth --------------------------------- */

  // The login lookup is `GET /users?email=…`, matching JSON Server's filtering.
  http.get(`${API_URL}/users`, async ({ request }) => {
    await delay(LATENCY)
    const email = new URL(request.url).searchParams.get('email')
    const matches = email
      ? db.users.filter((user) => user.email.toLowerCase() === email.toLowerCase())
      : db.users
    return HttpResponse.json(matches)
  }),

  /* --------------------------------- shops -------------------------------- */

  http.get(`${API_URL}/shops`, async () => {
    await delay(LATENCY)
    return HttpResponse.json(db.shops)
  }),

  http.get(`${API_URL}/shops/:id`, async ({ params }) => {
    await delay(LATENCY)
    const shop = db.shops.find((item) => item.id === params.id)
    return shop ? HttpResponse.json(shop) : notFound()
  }),

  http.post(`${API_URL}/shops`, async ({ request }) => {
    await delay(LATENCY)
    const input = (await request.json()) as ShopInput & { createdAt?: string }
    const shop: Shop = {
      ...input,
      id: nextId('shop'),
      createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10),
    }
    db.shops.push(shop)
    persist()
    return HttpResponse.json(shop, { status: 201 })
  }),

  http.patch(`${API_URL}/shops/:id`, async ({ params, request }) => {
    await delay(LATENCY)
    const shop = db.shops.find((item) => item.id === params.id)
    if (!shop) return notFound()
    Object.assign(shop, (await request.json()) as Partial<ShopInput>)
    persist()
    return HttpResponse.json(shop)
  }),

  http.delete(`${API_URL}/shops/:id`, async ({ params }) => {
    await delay(LATENCY)
    const index = db.shops.findIndex((item) => item.id === params.id)
    if (index === -1) return notFound()
    const [removed] = db.shops.splice(index, 1)
    persist()
    return HttpResponse.json(removed)
  }),

  /* ------------------------------- products ------------------------------- */

  http.get(`${API_URL}/products`, async () => {
    await delay(LATENCY)
    return HttpResponse.json(db.products)
  }),

  http.get(`${API_URL}/products/:id`, async ({ params }) => {
    await delay(LATENCY)
    const product = db.products.find((item) => item.id === params.id)
    return product ? HttpResponse.json(product) : notFound()
  }),

  http.post(`${API_URL}/products`, async ({ request }) => {
    await delay(LATENCY)
    const input = (await request.json()) as ProductInput
    const product: Product = { ...input, id: nextId('p') }
    db.products.push(product)
    persist()
    return HttpResponse.json(product, { status: 201 })
  }),

  http.patch(`${API_URL}/products/:id`, async ({ params, request }) => {
    await delay(LATENCY)
    const product = db.products.find((item) => item.id === params.id)
    if (!product) return notFound()
    Object.assign(product, (await request.json()) as Partial<ProductInput>)
    persist()
    return HttpResponse.json(product)
  }),

  http.delete(`${API_URL}/products/:id`, async ({ params }) => {
    await delay(LATENCY)
    const index = db.products.findIndex((item) => item.id === params.id)
    if (index === -1) return notFound()
    const [removed] = db.products.splice(index, 1)
    persist()
    return HttpResponse.json(removed)
  }),
]
