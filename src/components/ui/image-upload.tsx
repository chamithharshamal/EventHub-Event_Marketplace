'use client'

import { useState, useRef } from 'react'
import { Image as ImageIcon, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadAvatarAction } from '@/app/actions/upload'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
    onRemove?: () => void
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    className,
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(value || null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File size must be less than 5MB')
            return
        }

        setIsUploading(true)
        setPreview(URL.createObjectURL(file)) // Optimistic preview
        console.log('Starting server upload...', { fileName: file.name, size: file.size })

        try {
            // Use server action instead of client-side upload
            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadAvatarAction(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            if (result.url) {
                console.log('Upload success:', result.url)
                onChange(result.url)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert(`Failed to upload image: ${(error as any)?.message || 'Unknown error'}`)
            setPreview(value || null) // Revert
        } finally {
            console.log('Upload finished')
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        if (onRemove) onRemove()
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className={cn('relative flex items-center gap-4', className)}>
            <div className="relative group overflow-hidden rounded-full h-24 w-24 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {preview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {preview && onRemove && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <p className="text-xs text-slate-500">
                    JPG, PNG or GIF. Max 5MB.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}
