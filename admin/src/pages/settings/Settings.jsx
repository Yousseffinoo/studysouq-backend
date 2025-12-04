import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Upload, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { uploadImage } from '../../services/admin/imagesService'
import { API } from '../../lib/apiClient'

export function Settings() {
  const { user, refreshUser } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar: null,
    avatarPreview: null
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: null,
        avatarPreview: user.avatar || null
      })
    }
  }, [user])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    try {
      setLoading(true)
      toast.loading('Uploading image...', { id: 'upload-image' })

      const imageData = await uploadImage({
        image: file,
        title: 'Admin profile image',
        category: 'profile'
      })

      // Handle response structure - API.upload returns image object directly
      // Backend returns: { success: true, message: "...", data: image }
      // API.upload returns: image object (response.data.data)
      console.log('Image upload response:', imageData)
      
      const imageUrl = imageData?.url || (imageData?.data && imageData.data.url)
      
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          avatar: imageUrl,
          avatarPreview: imageUrl
        }))
        toast.success('Image uploaded successfully', { id: 'upload-image' })
      } else {
        console.error('No image URL in response:', imageData)
        toast.error('Image uploaded but URL not found. Response: ' + JSON.stringify(imageData), { id: 'upload-image' })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image'
      toast.error(errorMessage, { id: 'upload-image' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      avatar: null,
      avatarPreview: null
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        name: formData.name.trim()
      }

      // Handle avatar update
      if (formData.avatar) {
        // New image uploaded
        updateData.avatar = formData.avatar
      } else if (formData.avatarPreview === null && user.avatar) {
        // User removed existing image, clear it
        updateData.avatar = ''
      }
      // If avatarPreview exists and no new avatar, don't send avatar field (keep existing)

      const response = await API.put('/api/users/profile', updateData)
      
      console.log('Profile update response:', response)
      
      // Handle response structure
      // Backend returns: { success: true, message: "...", data: { user: {...} } }
      // API.put returns: response.data.data (which is { user: {...} }) or response.data
      const userData = response?.user || (response?.data && response.data.user) || response
      
      if (userData && (userData.name || userData.avatar !== undefined)) {
        // Update user in localStorage
        const updatedUser = {
          ...user,
          name: userData.name !== undefined ? userData.name : user.name,
          avatar: userData.avatar !== undefined ? (userData.avatar || null) : user.avatar
        }
        
        console.log('Updating user:', updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Refresh user data in auth state
        const refreshedUser = await refreshUser()
        if (refreshedUser) {
          // Update formData with refreshed user data
          setFormData(prev => ({
            ...prev,
            name: refreshedUser.name || updatedUser.name,
            avatar: null, // Clear the upload state
            avatarPreview: refreshedUser.avatar || updatedUser.avatar || null
          }))
        } else {
          // Fallback: update formData with local data
          setFormData(prev => ({
            ...prev,
            name: updatedUser.name,
            avatar: null,
            avatarPreview: updatedUser.avatar || null
          }))
        }
        
        // Toast is already shown by API.put
      } else {
        console.error('No user data in response:', response)
        toast.error('Profile updated but user data not found in response')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your admin profile</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>Update your name and profile image</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  {formData.avatarPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.avatarPreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-md border-2 border-background touch-manipulation"
                        data-cursor="hover"
                        aria-label="Remove profile image"
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={loading}
                      className="cursor-pointer"
                      data-cursor="hover"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a profile image (max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Admin Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  data-cursor="hover"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                  data-cursor="not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full touch-manipulation min-h-[44px] md:min-h-0" 
                data-cursor="hover"
                disabled={saving || loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
