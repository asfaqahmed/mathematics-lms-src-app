import { z } from 'zod'

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Course Validations
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.enum(['USD', 'LKR', 'INR']),
  status: z.enum(['draft', 'published', 'archived'])
})

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  video_url: z.string().url('Invalid video URL').optional(),
  content: z.string().optional(),
  order: z.number().int().min(0, 'Order must be a positive integer'),
  duration: z.number().int().min(0, 'Duration must be positive').optional()
})

// Progress Validations
export const progressSchema = z.object({
  lesson_id: z.string().uuid('Invalid lesson ID'),
  progress_percentage: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
  watch_time: z.number().min(0, 'Watch time must be positive'),
  completed: z.boolean()
})

// Assignment Validations
export const assignmentSchema = z.object({
  course_id: z.string().uuid('Invalid course ID'),
  lesson_id: z.string().uuid('Invalid lesson ID').optional(),
  file: z.object({
    name: z.string().min(1, 'File name is required'),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    type: z.string().refine((type) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
      return allowedTypes.includes(type)
    }, 'Invalid file type')
  })
})

// Contact Form Validation
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long')
})

// Payment Validations
export const paymentSchema = z.object({
  course_id: z.string().uuid('Invalid course ID'),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.enum(['USD', 'LKR', 'INR']),
  payment_method: z.enum(['stripe', 'payhere', 'bank_transfer'])
})

// Search and Filter Validations
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  sort: z.enum(['title', 'price', 'created_at', 'updated_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

// API Response Validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  }),
  error: z.string().optional(),
  message: z.string().optional()
})

// Type inference
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type LessonInput = z.infer<typeof lessonSchema>
export type ProgressInput = z.infer<typeof progressSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>