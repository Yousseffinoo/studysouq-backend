import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@/lib/apiClient'
import toast from 'react-hot-toast'

// ============ SUBJECTS ============
export function useSubjects(params = {}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => API.get('/api/admin/subjects', { params }),
  })
}

export function useSubject(id) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: () => API.get(`/api/admin/subjects/${id}`),
    enabled: !!id,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/subjects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

// ============ SECTIONS ============
export function useSections(params = {}) {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: () => API.get('/api/admin/sections', { params }),
  })
}

export function useSection(id) {
  return useQuery({
    queryKey: ['section', id],
    queryFn: () => API.get(`/api/admin/sections/${id}`),
    enabled: !!id,
  })
}

export function useCreateSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/sections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/sections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/sections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })
}

// ============ LESSONS ============
export function useLessons(params = {}) {
  return useQuery({
    queryKey: ['lessons', params],
    queryFn: () => API.get('/api/admin/lessons', { params }),
  })
}

export function useLesson(id) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => API.get(`/api/admin/lessons/${id}`),
    enabled: !!id,
  })
}

export function useCreateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/lessons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/lessons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

// ============ NOTES ============
export function useNotes(params = {}) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => API.get('/api/admin/notes', { params }),
  })
}

export function useNote(id) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => API.get(`/api/admin/notes/${id}`),
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

// ============ USERS ============
export function useUsers(params = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => API.get('/api/admin/users', { params }),
  })
}

export function useUser(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => API.get(`/api/admin/users/${id}`),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useToggleUserBan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.patch(`/api/admin/users/${id}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ============ PAYMENTS ============
export function usePayments(params = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => API.get('/api/admin/payments', { params }),
  })
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['paymentStats'],
    queryFn: () => API.get('/api/admin/payments/stats'),
  })
}

// ============ PRICING ============
export function usePricing(params = {}) {
  return useQuery({
    queryKey: ['pricing', params],
    queryFn: () => API.get('/api/admin/pricing', { params }),
  })
}

export function useCreatePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/admin/pricing', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
    },
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/admin/pricing/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
    },
  })
}

export function useDeletePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/pricing/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
    },
  })
}

// ============ IMAGES ============
export function useImages(params = {}) {
  return useQuery({
    queryKey: ['images', params],
    queryFn: () => API.get('/api/admin/images', { params }),
  })
}

export function useUploadImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => API.upload('/api/admin/images', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/admin/images/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}

// ============ SETTINGS ============
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => API.get('/api/admin/settings'),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.put('/api/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// ============ DASHBOARD ============
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => API.get('/api/admin/dashboard/stats'),
  })
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => API.get('/api/admin/dashboard/activities'),
  })
}

