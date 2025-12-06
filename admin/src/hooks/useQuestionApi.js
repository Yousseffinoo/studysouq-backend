import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

// Keys
const QUESTIONS_KEY = ['questions']
const SUBJECTS_KEY = ['subjects']
const LESSONS_KEY = ['lessons']

// Get all questions
export function useQuestions(params = {}) {
  return useQuery({
    queryKey: [...QUESTIONS_KEY, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined)
      ).toString()
      const { data } = await apiClient.get(`/admin/questions?${queryString}`)
      return data.data
    }
  })
}

// Get subjects (reuse from other hooks or create)
export function useSubjects(params = {}) {
  return useQuery({
    queryKey: [...SUBJECTS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/subjects', { params })
      return data.data
    }
  })
}

// Get lessons
export function useLessons(params = {}) {
  return useQuery({
    queryKey: [...LESSONS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/lessons', { params })
      return data.data
    }
  })
}

// Create question
export function useCreateQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (questionData) => {
      const { data } = await apiClient.post('/admin/questions', questionData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEY })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create question')
    }
  })
}

// Update question
export function useUpdateQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data: questionData }) => {
      const { data } = await apiClient.put(`/admin/questions/${id}`, questionData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEY })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update question')
    }
  })
}

// Delete question
export function useDeleteQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/admin/questions/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEY })
      toast.success('Question deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete question')
    }
  })
}

// Generate AI questions (for admin testing)
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: async ({ subject, lesson, difficulty, numberOfQuestions }) => {
      const { data } = await apiClient.post('/questions/generate', {
        lessonId: lesson,
        subject,
        difficulty,
        numberOfQuestions
      })
      return {
        success: data.success,
        generatedQuestions: data.data?.questions || []
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate questions')
    }
  })
}

// Upload questions PDF (past paper)
export function useUploadQuestionsPDF() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (formData) => {
      // Create FormData with correct field name
      const fd = new FormData()
      fd.append('questionsPdf', formData.get('pdf'))
      fd.append('subject', formData.get('subject'))
      fd.append('lessonId', formData.get('lesson'))
      
      const { data } = await apiClient.post('/questions/upload/questions-pdf', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEY })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload PDF')
    }
  })
}

// Upload markscheme PDF
export function useUploadMarkschemePDF() {
  return useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData()
      fd.append('markschemePdf', formData.get('pdf'))
      
      const { data } = await apiClient.post('/questions/upload/markscheme-pdf', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload markscheme')
    }
  })
}

// Save extracted questions to database
export function useSavePastPaperQuestions() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ questionsData, markschemeData, metadata }) => {
      const { data } = await apiClient.post('/questions/upload/save', {
        questionsData,
        markschemeData,
        metadata
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_KEY })
      toast.success('Questions saved to database')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save questions')
    }
  })
}

export default {
  useQuestions,
  useSubjects,
  useLessons,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useGenerateQuestions,
  useUploadQuestionsPDF,
  useUploadMarkschemePDF,
  useSavePastPaperQuestions
}
