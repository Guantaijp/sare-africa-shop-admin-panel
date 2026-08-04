import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateProduct,
  useInventory,
  useUpdateProduct,
} from '@/features/inventory/use-inventory'
import { toErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types'

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required.'),
  shopId: z.string().min(1, 'Choose the shop this product belongs to.'),
  price: z
    .number({ error: 'Price is required.' })
    .gt(0, 'Price must be greater than zero.'),
  stock: z
    .number({ error: 'Stock is required.' })
    .int('Enter a whole number of units.')
    .min(0, 'Stock cannot be negative.'),
  description: z
    .string()
    .trim()
    .max(300, 'Keep the description under 300 characters.'),
  sku: z.string().trim(),
  category: z.string().trim(),
  image: z.string(),
})

type ProductValues = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  defaultShopId?: string
}

/** Mounts fresh per dialog open, so no effect is needed to reset the fields. */
function ProductForm({
  product,
  defaultShopId,
  onDone,
}: {
  product?: Product | null
  defaultShopId?: string
  onDone: () => void
}) {
  const { shops } = useInventory()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isEdit = Boolean(product)

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      shopId: product?.shopId ?? defaultShopId ?? '',
      // Zero is no longer a valid price, so a new product starts with an empty
      // field rather than a pre-filled value the user has to clear.
      price: product?.price ?? NaN,
      stock: product?.stock ?? 0,
      description: product?.description ?? '',
      sku: product?.sku ?? '',
      category: product?.category ?? '',
      image: product?.image ?? '',
    },
  })

  const onSubmit = async (values: ProductValues) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, input: values })
        toast.success('Product updated', { description: values.name })
      } else {
        await createProduct.mutateAsync(values)
        toast.success('Product created', { description: values.name })
      }
      onDone()
    } catch (error) {
      toast.error('Could not save product', {
        description: toErrorMessage(error),
      })
    }
  }

  // useWatch (not form.watch) so the value is a plain subscription React can
  // memoize — form.watch() returns a function the compiler must bail out on.
  const price = useWatch({ control: form.control, name: 'price' })
  const stock = useWatch({ control: form.control, name: 'stock' })
  const description = useWatch({ control: form.control, name: 'description' }) ?? ''
  const stockValue = price > 0 && stock > 0 ? formatCurrency(price * stock) : null
  const isSaving = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update pricing, stock and details for this product.'
              : 'Add a new product to a shop’s inventory.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-5">
          <FormField
            control={form.control}
            name="image"
            // Not wrapped in FormControl — see shop-form-dialog for why.
            render={({ field }) => (
              <ImagePicker
                label="Product image"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Product name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Maize Flour 2kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shopId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Shop <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a shop" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price (KES) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 180"
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? NaN : e.target.valueAsNumber,
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Stock (units) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? NaN : e.target.valueAsNumber,
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SAR-1042" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Staples" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What is this product?"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between gap-3">
                  <FormMessage />
                  <FormDescription className="tabular-nums">
                    {description.length}/300
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

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
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  defaultShopId,
}: ProductFormDialogProps) {
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
