import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const MAX_BYTES = 2 * 1024 * 1024

/**
 * Preview + picker for a single image. Accepts either a pasted URL or a local
 * file, which is inlined as a data URL so the prototype needs no upload API.
 */
export function ImagePicker({
  value,
  onChange,
  label = 'Image',
  fallback = '',
  rounded = 'rounded-xl',
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setError('')
      onChange(String(reader.result))
    }
    reader.onerror = () => setError('Could not read that file.')
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center overflow-hidden border bg-muted',
            rounded,
          )}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className="size-full object-cover"
              onError={() => setError('That image URL could not be loaded.')}
            />
          ) : fallback ? (
            <span className="text-sm font-bold text-muted-foreground">
              {fallback}
            </span>
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value?.startsWith('data:') ? '' : (value ?? '')}
            placeholder={
              value?.startsWith('data:')
                ? 'Uploaded file selected'
                : 'Paste an image URL'
            }
            disabled={value?.startsWith('data:')}
            onChange={(e) => {
              setError('')
              onChange(e.target.value)
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" />
              Upload
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError('')
                  onChange('')
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}
