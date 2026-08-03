import { useState } from 'react'
import { toast } from 'sonner'

import { ImagePicker } from '@/components/shared/image-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { useInventory } from '@/store/use-inventory'

const emptyValues = (shopId = '') => ({
  name: '',
  shopId,
  price: '',
  stock: '',
  sku: '',
  category: '',
  image: '',
})

/** Mounts fresh per dialog open, so no effect is needed to reset the fields. */
function ProductForm({ product, defaultShopId, onDone }) {
  const { shops, createProduct, updateProduct } = useInventory()
  const isEdit = Boolean(product)

  const [values, setValues] = useState(() =>
    product
      ? {
          name: product.name ?? '',
          shopId: product.shopId ?? '',
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          sku: product.sku ?? '',
          category: product.category ?? '',
          image: product.image ?? '',
        }
      : emptyValues(defaultShopId ?? ''),
  )
  const [errors, setErrors] = useState({})

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const validate = () => {
    const next = {}

    if (!values.name.trim()) next.name = 'Product name is required.'
    if (!values.shopId) next.shopId = 'Choose the shop this product belongs to.'

    const price = Number(values.price)
    if (values.price === '') next.price = 'Price is required.'
    else if (Number.isNaN(price) || price < 0)
      next.price = 'Enter a price of 0 or more.'

    const stock = Number(values.stock)
    if (values.stock === '') next.stock = 'Stock is required.'
    else if (!Number.isInteger(stock) || stock < 0)
      next.stock = 'Enter a whole number of 0 or more.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: values.name.trim(),
      shopId: values.shopId,
      price: Number(values.price),
      stock: Number(values.stock),
      sku: values.sku.trim(),
      category: values.category.trim(),
      image: values.image,
    }

    if (isEdit) {
      updateProduct(product.id, payload)
      toast.success('Product updated', { description: payload.name })
    } else {
      createProduct(payload)
      toast.success('Product created', { description: payload.name })
    }
    onDone()
  }

  const stockValue =
    Number(values.price) > 0 && Number(values.stock) > 0
      ? formatCurrency(Number(values.price) * Number(values.stock))
      : null

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update pricing, stock and details for this product.'
            : 'Add a new product to a shop’s inventory.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-5">
        <ImagePicker
          label="Product image"
          value={values.image}
          onChange={(image) => setValues((prev) => ({ ...prev, image }))}
        />

        <div className="grid gap-2">
          <Label htmlFor="product-name">
            Product name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-name"
            value={values.name}
            onChange={setField('name')}
            placeholder="e.g. Maize Flour 2kg"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product-shop">
            Shop <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.shopId}
            onValueChange={(shopId) =>
              setValues((prev) => ({ ...prev, shopId }))
            }
          >
            <SelectTrigger
              id="product-shop"
              className="w-full"
              aria-invalid={Boolean(errors.shopId)}
            >
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.shopId && (
            <p className="text-xs text-destructive">{errors.shopId}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-price">
              Price (KES) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="1"
              value={values.price}
              onChange={setField('price')}
              placeholder="0"
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-stock">
              Stock (units) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={values.stock}
              onChange={setField('stock')}
              placeholder="0"
              aria-invalid={Boolean(errors.stock)}
            />
            {errors.stock && (
              <p className="text-xs text-destructive">{errors.stock}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              value={values.sku}
              onChange={setField('sku')}
              placeholder="e.g. SAR-1042"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              value={values.category}
              onChange={setField('category')}
              placeholder="e.g. Staples"
            />
          </div>
        </div>

        {stockValue && (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Stock value</span>
            <span className="font-semibold tabular-nums">{stockValue}</span>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Save changes' : 'Add product'}</Button>
      </DialogFooter>
    </form>
  )
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  defaultShopId,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && (
          <ProductForm
            key={product?.id ?? 'new'}
            product={product}
            defaultShopId={defaultShopId}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
