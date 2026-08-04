import { AlertTriangle, Ban, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { useDeleteShop, useInventory } from '@/features/inventory/use-inventory'
import { toErrorMessage } from '@/lib/api'
import type { Shop } from '@/types'

interface DeleteShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop?: Shop | null
  onDeleted?: () => void
}

/**
 * Confirms shop deletion, but refuses outright while the shop still holds
 * products — the blocked branch explains why and offers a way to go fix it.
 */
export function DeleteShopDialog({
  open,
  onOpenChange,
  shop,
  onDeleted,
}: DeleteShopDialogProps) {
  const { products } = useInventory()
  const deleteShop = useDeleteShop()
  const navigate = useNavigate()

  if (!shop) return null

  const productCount = products.filter((p) => p.shopId === shop.id).length
  const blocked = productCount > 0

  const handleDelete = async (event: React.MouseEvent) => {
    // Keep the dialog open until the request settles.
    event.preventDefault()
    try {
      await deleteShop.mutateAsync(shop.id)
      toast.success('Shop deleted', { description: shop.name })
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toast.error('Could not delete shop', {
        description: toErrorMessage(error),
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={
              blocked
                ? 'mb-1 flex size-10 items-center justify-center rounded-full bg-chart-4/15 text-chart-4'
                : 'mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'
            }
          >
            {blocked ? (
              <Ban className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
          </div>

          <AlertDialogTitle>
            {blocked ? 'Cannot delete this shop' : `Delete ${shop.name}?`}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {blocked ? (
              <>
                <span className="font-medium text-foreground">{shop.name}</span>{' '}
                still has{' '}
                <span className="font-medium text-foreground">
                  {productCount} product{productCount === 1 ? '' : 's'}
                </span>{' '}
                assigned to it. Move those products to another shop or delete
                them first, then try again.
              </>
            ) : (
              <>
                This permanently removes{' '}
                <span className="font-medium text-foreground">{shop.name}</span>{' '}
                from the network. This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {blocked ? (
            <>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/shops/${shop.id}`)
                }}
              >
                View its products
              </Button>
            </>
          ) : (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteShop.isPending}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleteShop.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Delete shop
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
