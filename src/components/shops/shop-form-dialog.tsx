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
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateShop,
  useInventory,
  useUpdateShop,
} from '@/features/inventory/use-inventory'
import { toErrorMessage } from '@/lib/api'
import { initialsOf } from '@/lib/format'
import type { Shop } from '@/types'

const shopSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters.'),
  location: z.string().trim(),
  description: z
    .string()
    .trim()
    .max(200, 'Keep the description under 200 characters.'),
  logo: z.string(),
})

type ShopValues = z.infer<typeof shopSchema>

interface ShopFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop?: Shop | null
}

/**
 * The form lives in its own component so it mounts fresh each time the dialog
 * opens — no effect needed to sync props into state.
 */
function ShopForm({
  shop,
  onDone,
}: {
  shop?: Shop | null
  onDone: () => void
}) {
  const { shops } = useInventory()
  const createShop = useCreateShop()
  const updateShop = useUpdateShop()
  const isEdit = Boolean(shop)

  const form = useForm<ShopValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: shop?.name ?? '',
      location: shop?.location ?? '',
      description: shop?.description ?? '',
      logo: shop?.logo ?? '',
    },
  })

  const onSubmit = async (values: ShopValues) => {
    // Uniqueness needs the other shops, so it can't live in the schema.
    const clash = shops.some(
      (s) =>
        s.id !== shop?.id &&
        s.name.trim().toLowerCase() === values.name.toLowerCase(),
    )
    if (clash) {
      form.setError('name', {
        message: 'Another shop already uses this name.',
      })
      return
    }

    try {
      if (shop) {
        await updateShop.mutateAsync({ id: shop.id, input: values })
        toast.success('Shop updated', { description: values.name })
      } else {
        await createShop.mutateAsync(values)
        toast.success('Shop created', { description: values.name })
      }
      onDone()
    } catch (error) {
      toast.error('Could not save shop', {
        description: toErrorMessage(error),
      })
    }
  }

  const isSaving = form.formState.isSubmitting
  // useWatch (not form.watch) keeps these as plain memoizable subscriptions.
  const description = useWatch({ control: form.control, name: 'description' }) ?? ''
  const watchedName = useWatch({ control: form.control, name: 'name' }) ?? ''

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit shop' : 'Create shop'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this location.'
              : 'Add a new retail location to the network.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-5">
          <FormField
            control={form.control}
            name="logo"
            // ImagePicker renders its own <Label>, so it is deliberately not
            // wrapped in FormControl (that Slot would hijack the field id).
            render={({ field }) => (
              <ImagePicker
                label="Shop logo"
                value={field.value}
                fallback={initialsOf(watchedName)}
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
                  Shop name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kibera Mart" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kibera, Nairobi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What does this shop sell?"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between gap-3">
                  <FormMessage />
                  <FormDescription className="tabular-nums">
                    {description.length}/200
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create shop'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export function ShopFormDialog({
  open,
  onOpenChange,
  shop,
}: ShopFormDialogProps) {
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
