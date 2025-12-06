import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@/lib/apiClient'

// Re-export subjects and lessons from main API hooks
export { useSubjects, useLessons } from './useApi'

// ============ QUESTIONS ============

export function useQuestions(params = {}) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => API.get('/api/questions/admin/all', { params }),
  })
}

export function useQuestion(id) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => API.get(`/api/questions/admin/${id}`),
    enabled: !!id,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/questions/admin/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => API.put(`/api/questions/admin/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.delete(`/api/questions/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

// ============ AI GENERATION ============

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: (data) => API.post('/api/questions/admin/generate', data),
  })
}

export function useSaveGeneratedQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/questions/admin/save-generated', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useRegenerateExplanation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => API.post(`/api/questions/admin/${id}/regenerate-explanation`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

// ============ PDF UPLOAD ============

export function useUploadQuestionsPDF() {
  return useMutation({
    mutationFn: (formData) => API.upload('/api/questions/admin/upload-questions-pdf', formData),
  })
}

export function useUploadMarkschemePDF() {
  return useMutation({
    mutationFn: (formData) => API.upload('/api/questions/admin/upload-markscheme-pdf', formData),
  })
}

export function useMergeAndSaveQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => API.post('/api/questions/admin/merge-and-save', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

