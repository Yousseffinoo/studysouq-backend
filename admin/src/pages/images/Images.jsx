import { useState, useRef } from 'react'
import { Upload, Trash2, ImageIcon, Copy, Check } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  Pagination,
  EmptyState,
  PageSpinner,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { useImages, useUploadImage, useDeleteImage } from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Images() {
  const [page, setPage] = useState(1)
  const [deleteImage, setDeleteImage] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const fileInputRef = useRef(null)

  const { data, isLoading } = useImages({ page, limit: 12 })
  const uploadMutation = useUploadImage()
  const deleteMutation = useDeleteImage()

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }

      const formData = new FormData()
      formData.append('image', file)

      try {
        await uploadMutation.mutateAsync(formData)
        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!deleteImage) return
    try {
      await deleteMutation.mutateAsync(deleteImage._id)
      toast.success('Image deleted successfully')
      setDeleteImage(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(url)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('URL copied to clipboard')
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  if (isLoading) return <PageSpinner />

  const images = data?.images || data || []
  const totalPages = data?.totalPages || 1

  return (
    <div>
      <PageHeader
        title="Images"
        description="Upload and manage images for your content"
        breadcrumbs={[{ label: 'Images' }]}
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={uploadMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </>
        }
      />

      {images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images uploaded"
          description="Upload images to use in your lessons and notes"
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image._id} className="overflow-hidden group">
                <div className="aspect-square relative bg-neutral-100">
                  <img
                    src={image.url}
                    alt={image.name || 'Image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => copyUrl(image.url)}
                    >
                      {copiedId === image.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {image.name || image.originalName || 'Untitled'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(image.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteImage}
        onOpenChange={() => setDeleteImage(null)}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
