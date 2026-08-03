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
import { Textarea } from '@/components/ui/textarea'
import { initialsOf } from '@/lib/format'
import { useInventory } from '@/store/use-inventory'

const emptyValues = () => ({
  name: '',
  description: '',
  location: '',
  logo: '',
})

/**
 * The form lives in its own component so it mounts fresh each time the dialog
 * opens — no effect needed to sync props into state.
 */
function ShopForm({ shop, onDone }) {
  const { createShop, updateShop, shops } = useInventory()
  const isEdit = Boolean(shop)

  const [values, setValues] = useState(() =>
    shop
      ? {
          name: shop.name ?? '',
          description: shop.description ?? '',
          location: shop.location ?? '',
          logo: shop.logo ?? '',
        }
      : emptyValues(),
  )
  const [errors, setErrors] = useState({})

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const validate = () => {
    const next = {}
    const name = values.name.trim()

    if (!name) next.name = 'Shop name is required.'
    else if (name.length < 2) next.name = 'Use at least 2 characters.'
    else if (
      shops.some(
        (s) =>
          s.id !== shop?.id && s.name.trim().toLowerCase() === name.toLowerCase(),
      )
    )
      next.name = 'Another shop already uses this name.'

    if (values.description.trim().length > 200)
      next.description = 'Keep the description under 200 characters.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      logo: values.logo,
    }

    if (isEdit) {
      updateShop(shop.id, payload)
      toast.success('Shop updated', { description: payload.name })
    } else {
      createShop(payload)
      toast.success('Shop created', { description: payload.name })
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit shop' : 'Create shop'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the details for this location.'
            : 'Add a new retail location to the network.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-5">
        <ImagePicker
          label="Shop logo"
          value={values.logo}
          fallback={initialsOf(values.name)}
          onChange={(logo) => setValues((prev) => ({ ...prev, logo }))}
        />

        <div className="grid gap-2">
          <Label htmlFor="shop-name">
            Shop name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="shop-name"
            value={values.name}
            onChange={setField('name')}
            placeholder="e.g. Kibera Mart"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="shop-location">Location</Label>
          <Input
            id="shop-location"
            value={values.location}
            onChange={setField('location')}
            placeholder="e.g. Kibera, Nairobi"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="shop-description">Description</Label>
          <Textarea
            id="shop-description"
            value={values.description}
            onChange={setField('description')}
            placeholder="What does this shop sell?"
            rows={3}
            aria-invalid={Boolean(errors.description)}
          />
          <div className="flex justify-between text-xs">
            <span className="text-destructive">{errors.description}</span>
            <span className="tabular-nums text-muted-foreground">
              {values.description.length}/200
            </span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Save changes' : 'Create shop'}</Button>
      </DialogFooter>
    </form>
  )
}

export function ShopFormDialog({ open, onOpenChange, shop }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ShopForm
            key={shop?.id ?? 'new'}
            shop={shop}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
