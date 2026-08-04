import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteProduct } from '@/features/inventory/use-inventory'
import { toErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types'

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
}: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct()

  if (!product) return null

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success('Product deleted', { description: product.name })
      onOpenChange(false)
    } catch (error) {
      toast.error('Could not delete product', {
        description: toErrorMessage(error),
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the product and its{' '}
            <span className="font-medium text-foreground">
              {product.stock} units
            </span>{' '}
            ({formatCurrency(product.price * product.stock)} of stock value) from
            inventory. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteProduct.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
