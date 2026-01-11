import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ZoomIn, Move, RotateCw } from 'lucide-react'

interface ImageCropperModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageFile: File | null
  aspectRatio: number
  onCropComplete: (croppedFile: File) => Promise<void> | void
}

export function ImageCropperModal({
  open,
  onOpenChange,
  imageFile,
  aspectRatio,
  onCropComplete,
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [processing, setProcessing] = useState(false)
  const [minZoom, setMinZoom] = useState(1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const clampPan = (x: number, y: number) => {
    const img = imageRef.current
    const container = containerRef.current
    if (!img || !container) return { x, y }

    const containerWidth = container.clientWidth
    const containerHeight = 400

    let cropWidth: number
    let cropHeight: number
    if (containerWidth / containerHeight > aspectRatio) {
      cropHeight = containerHeight * 0.8
      cropWidth = cropHeight * aspectRatio
    } else {
      cropWidth = containerWidth * 0.8
      cropHeight = cropWidth / aspectRatio
    }

    const maxX = Math.max(0, (img.width * zoom - cropWidth) / 2)
    const maxY = Math.max(0, (img.height * zoom - cropHeight) / 2)

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    }
  }

  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null)
      return
    }

    const url = URL.createObjectURL(imageFile)
    setImageSrc(url)
    setPan({ x: 0, y: 0 })
    setRotation(0)

  }, [imageFile])


  useEffect(() => {
    const img = imageRef.current
    if (img && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = 400

      let cropWidth: number
      let cropHeight: number
      if (containerWidth / containerHeight > aspectRatio) {
        cropHeight = containerHeight * 0.8
        cropWidth = cropHeight * aspectRatio
      } else {
        cropWidth = containerWidth * 0.8
        cropHeight = cropWidth / aspectRatio
      }

      const scaleToFit = Math.min(cropWidth / img.width, cropHeight / img.height)
      setMinZoom(scaleToFit)
      setZoom(prev => Math.max(prev, scaleToFit))
    }
  }, [aspectRatio, rotation])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const container = containerRef.current

    if (!canvas || !ctx || !container || !imageSrc) return

    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      imageRef.current = img

      const containerWidth = container.clientWidth
      const containerHeight = 400

      let cropWidth: number
      let cropHeight: number
      if (containerWidth / containerHeight > aspectRatio) {
        cropHeight = containerHeight * 0.8
        cropWidth = cropHeight * aspectRatio
      } else {
        cropWidth = containerWidth * 0.8
        cropHeight = cropWidth / aspectRatio
      }

      const scaleToFit = Math.min(cropWidth / img.width, cropHeight / img.height)
      setZoom(scaleToFit)
      setMinZoom(scaleToFit)
    }
  }, [imageSrc, aspectRatio])

  useEffect(() => {
    if (imageRef.current) draw()
  }, [zoom, pan, rotation, aspectRatio])

  const draw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const container = containerRef.current
    const img = imageRef.current
    if (!canvas || !ctx || !container || !img) return

    const containerWidth = container.clientWidth
    const containerHeight = 400

    canvas.width = containerWidth
    canvas.height = containerHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let cropWidth: number
    let cropHeight: number
    if (containerWidth / containerHeight > aspectRatio) {
      cropHeight = containerHeight * 0.8
      cropWidth = cropHeight * aspectRatio
    } else {
      cropWidth = containerWidth * 0.8
      cropHeight = cropWidth / aspectRatio
    }

    const cropX = (containerWidth - cropWidth) / 2
    const cropY = (containerHeight - cropHeight) / 2

    ctx.save()
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    ctx.translate(centerX + pan.x, centerY + pan.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    ctx.restore()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, canvas.width, cropY)
    ctx.fillRect(0, cropY + cropHeight, canvas.width, canvas.height - (cropY + cropHeight))
    ctx.fillRect(0, cropY, cropX, cropHeight)
    ctx.fillRect(cropX + cropWidth, cropY, canvas.width - (cropX + cropWidth), cropHeight)

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cropX + cropWidth / 3, cropY)
    ctx.lineTo(cropX + cropWidth / 3, cropY + cropHeight)
    ctx.moveTo(cropX + (cropWidth * 2) / 3, cropY)
    ctx.lineTo(cropX + (cropWidth * 2) / 3, cropY + cropHeight)
    ctx.moveTo(cropX, cropY + cropHeight / 3)
    ctx.lineTo(cropX + cropWidth, cropY + cropHeight / 3)
    ctx.moveTo(cropX, cropY + (cropHeight * 2) / 3)
    ctx.lineTo(cropX + cropWidth, cropY + (cropHeight * 2) / 3)
    ctx.stroke()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const next = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }
    setPan(clampPan(next.x, next.y))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
      ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current || !imageFile) return
    setProcessing(true)

    try {
      const img = imageRef.current
      const cropCanvas = document.createElement('canvas')

      const targetWidth = 1200
      const targetHeight = targetWidth / aspectRatio

      cropCanvas.width = targetWidth
      cropCanvas.height = targetHeight

      const ctx = cropCanvas.getContext('2d')
      if (!ctx) throw new Error('No context')

      const visibleCanvas = canvasRef.current
      const containerWidth = visibleCanvas.width
      const containerHeight = visibleCanvas.height

      let visibleCropWidth: number
      let visibleCropHeight: number
      if (containerWidth / containerHeight > aspectRatio) {
        visibleCropHeight = containerHeight * 0.8
        visibleCropWidth = visibleCropHeight * aspectRatio
      } else {
        visibleCropWidth = containerWidth * 0.8
        visibleCropHeight = visibleCropWidth / aspectRatio
      }

      const scaleFactor = targetWidth / visibleCropWidth

      ctx.translate(targetWidth / 2, targetHeight / 2)
      ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom * scaleFactor, zoom * scaleFactor)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      const blob: Blob | null = await new Promise((resolve) => {
        cropCanvas.toBlob((b) => resolve(b), 'image/png', 0.9)
      })

      if (!blob) throw new Error('Failed to crop image')

      const originalExt = imageFile.name.split('.').pop() || 'png'
      const safeName = `crop-${Date.now()}.${originalExt}`

      const file = new File([blob], safeName, { type: 'image/png' })
      await onCropComplete(file)
    } catch (e) {
      console.error(e)
    } finally {
      setProcessing(false)
    }
  }

  const maxZoom = Math.max(minZoom * 3, 1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = -Math.sign(e.deltaY) * 0.1 * minZoom
      setZoom(z => Math.min(Math.max(minZoom, z + delta), maxZoom))
    }

    el.addEventListener('wheel', wheelHandler, { passive: false })
    return () => el.removeEventListener('wheel', wheelHandler)
  }, [minZoom, maxZoom])

  useEffect(() => {
    setPan(p => clampPan(p.x, p.y))
  }, [zoom, rotation])

  useEffect(() => {
    if (!open && imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }
  }, [open, imageSrc])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader className="p-4 bg-zinc-900 border-b border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-base font-medium">
            <Move className="h-4 w-4" /> Position & Scale
          </DialogTitle>
        </DialogHeader>

        <div ref={containerRef} className="relative w-full h-[400px] bg-zinc-950 cursor-move touch-none overflow-hidden">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-full block"
          />
        </div>

        <div className="p-4 space-y-4 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <ZoomIn className="h-4 w-4 text-zinc-400" />
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={minZoom * 0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRotation(r => r + 90)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              disabled={processing}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCrop}
              disabled={processing}
              className="bg-white text-black hover:bg-zinc-200 min-w-[100px]"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply Crop'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
