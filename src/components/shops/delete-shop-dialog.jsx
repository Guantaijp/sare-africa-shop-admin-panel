import { AlertTriangle, Ban } from 'lucide-react'
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
import { useInventory } from '@/store/use-inventory'

/**
 * Confirms shop deletion, but refuses outright while the shop still holds
 * products — the blocked branch explains why and offers a way to go fix it.
 */
export function DeleteShopDialog({ open, onOpenChange, shop, onDeleted }) {
  const { deleteShop, countShopProducts } = useInventory()
  const navigate = useNavigate()

  if (!shop) return null

  const productCount = countShopProducts(shop.id)
  const blocked = productCount > 0

  const handleDelete = () => {
    const result = deleteShop(shop.id)
    if (!result.ok) {
      toast.error('Cannot delete shop', { description: result.message })
      return
    }
    toast.success('Shop deleted', { description: shop.name })
    onOpenChange(false)
    onDeleted?.()
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
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete shop
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
